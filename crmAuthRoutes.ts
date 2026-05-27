import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import {
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  verificarSenha,
  criarToken,
  verificarToken,
  cookieOptions,
  getCookieName,
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  atualizarUltimoLogin,
} from "./crmAuth";

// ── BG Campo PWA origins ───────────────────────────────────────────────────
const CAMPO_PWA_ORIGINS = [
  "https://machinebg.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
];
import { getDb } from "./db";
import { crmConvites, crmUsers } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import nodemailer from "nodemailer";

import { hashSenha } from "./crmAuth";

const router = Router();
const COOKIE = getCookieName();

// ── TEMPORARY: Reset admin route (remove after first use) ───────────────
router.get("/reset-admin-temp", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) { res.json({ error: "DB not available" }); return; }
    
    // Check if admin exists
    const existing = await db.select().from(crmUsers).where(eq(crmUsers.email, "admin@bgservice.com.br")).limit(1);
    const senhaHash = await hashSenha("bgservice2026");
    
    if (existing.length > 0) {
      await db.update(crmUsers).set({ senhaHash, ativo: 1 }).where(eq(crmUsers.email, "admin@bgservice.com.br"));
      res.json({ success: true, action: "updated", email: "admin@bgservice.com.br", senha: "bgservice2026" });
    } else {
      await db.insert(crmUsers).values({
        nome: "Administrador",
        email: "admin@bgservice.com.br",
        senhaHash,
        role: "admin",
        ativo: 1,
      });
      res.json({ success: true, action: "created", email: "admin@bgservice.com.br", senha: "bgservice2026" });
    }
  } catch (err: any) {
    res.json({ error: err?.message, stack: err?.stack?.substring(0, 500) });
  }
});

// ── TEMPORARY: Debug route ──────────────────────────────────────────────
router.get("/debug-users", async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) { res.json({ error: "DB not available", dbUrl: process.env.DATABASE_URL ? "set" : "not set" }); return; }
    const users = await db.select({ id: crmUsers.id, email: crmUsers.email, role: crmUsers.role, ativo: crmUsers.ativo }).from(crmUsers).limit(10);
    res.json({ users, dbUrl: "set" });
  } catch (err: any) {
    res.json({ error: err?.message, code: err?.code });
  }
});

// ── Middleware: autenticação ──────────────────────────────────────────────

export async function requireCrmAuth(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.headers?.["authorization"]?.replace("Bearer ", "").trim();
  const token = bearerToken || req.cookies?.[COOKIE];
  if (!token) { res.status(401).json({ error: "Não autenticado" }); return; }
  const payload = await verificarToken(token);
  if (!payload) { res.status(401).json({ error: "Sessão expirada" }); return; }
  (req as any).crmUser = payload;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).crmUser;
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Acesso restrito a administradores" }); return; }
  next();
}

// ── POST /api/crm-auth/login ──────────────────────────────────────────────

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body as { email?: string; senha?: string };
    if (!email || !senha) { res.status(400).json({ error: "E-mail e senha são obrigatórios" }); return; }

    const user = await buscarUsuarioPorEmail(email);
    if (!user || !user.ativo) { res.status(401).json({ error: "Credenciais inválidas" }); return; }

    const ok = await verificarSenha(senha, user.senhaHash);
    if (!ok) { res.status(401).json({ error: "Credenciais inválidas" }); return; }

    await atualizarUltimoLogin(user.id);

    const token = await criarToken(user);
    const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
    res.cookie(COOKIE, token, cookieOptions(secure));

    const modulosArr = user.modulos ? (() => { try { return JSON.parse(user.modulos); } catch { return []; } })() : [];
    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      _token: token, // for cross-origin PWA clients (BG Campo)
      modulos: modulosArr,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro interno" });
  }
});

// ── POST /api/crm-auth/logout ─────────────────────────────────────────────

router.post("/logout", (req: Request, res: Response) => {
  const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
  res.clearCookie(COOKIE, { ...cookieOptions(secure), maxAge: -1 });
  res.json({ success: true });
});

// ── GET /api/crm-auth/me ──────────────────────────────────────────────────

router.get("/me", requireCrmAuth, async (req: Request, res: Response) => {
  const payload = (req as any).crmUser;
  // Buscar dados atualizados do banco
  const user = await buscarUsuarioPorId(payload.id);
  if (!user || !user.ativo) { res.status(401).json({ error: "Usuário inativo" }); return; }

  // ── Renovação automática do token ──────────────────────────────────────
  // Se o token foi emitido há mais de 7 dias, renova automaticamente
  // Isso garante que usuários ativos nunca sejam deslogados
  try {
    const iat = (payload as any).iat;
    if (iat) {
      const tokenAgeMs = Date.now() - (iat * 1000);
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      if (tokenAgeMs > SEVEN_DAYS_MS) {
        const newToken = await criarToken(user);
        const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
        res.cookie(COOKIE, newToken, cookieOptions(secure));
      }
    }
  } catch (renewErr) {
    // Não falhar se a renovação não funcionar
    console.error("[CRM Auth] Erro ao renovar token:", renewErr);
  }

  const regioesArr = user.regioes ? (() => { try { return JSON.parse(user.regioes); } catch { return []; } })() : [];
  const modulosArr = user.modulos ? (() => { try { return JSON.parse(user.modulos); } catch { return []; } })() : [];
  res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role, regioes: regioesArr, modulos: modulosArr });
});

// ── GET /api/crm-auth/usuarios ────────────────────────────────────────────

router.get("/usuarios", requireCrmAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lista = await listarUsuarios();
    res.json(lista);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao listar usuários" });
  }
});

// ── POST /api/crm-auth/usuarios ───────────────────────────────────────────

router.post("/usuarios", requireCrmAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, role, regioes, modulos } = req.body as {
      nome?: string; email?: string; senha?: string; role?: string; regioes?: string[]; modulos?: string[];
    };
    if (!nome || !email || !senha) {
      res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" }); return;
    }
    const roleValido = ["admin", "vendedor", "comercial", "tecnico"].includes(role ?? "") ? role as any : "vendedor";
    const regioesJson = regioes && regioes.length > 0 ? JSON.stringify(regioes) : null;
    const modulosJson = modulos && modulos.length > 0 ? JSON.stringify(modulos) : "[]";
    await criarUsuario({ nome, email, senha, role: roleValido, regioes: regioesJson, modulos: modulosJson } as any);
    res.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes("Duplicate") || err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "E-mail já cadastrado" }); return;
    }
    res.status(500).json({ error: err?.message ?? "Erro ao criar usuário" });
  }
});

// ── PATCH /api/crm-auth/usuarios/:id ─────────────────────────────────────

router.patch("/usuarios/:id", requireCrmAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, email, senha, role, ativo, regioes, modulos } = req.body as {
      nome?: string; email?: string; senha?: string; role?: string; ativo?: number; regioes?: string[]; modulos?: string[];
    };
    const roleValido = role && ["admin", "vendedor", "comercial", "tecnico"].includes(role) ? role as any : undefined;
    const regioesJson = regioes !== undefined ? JSON.stringify(regioes) : undefined;
    const modulosJson = modulos !== undefined ? JSON.stringify(modulos) : undefined;
    await atualizarUsuario(id, { nome, email, senha, role: roleValido, ativo, regioes: regioesJson, modulos: modulosJson } as any);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao atualizar usuário" });
  }
});

// ── DELETE /api/crm-auth/usuarios/:id ────────────────────────────────────

router.delete("/usuarios/:id", requireCrmAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const adminUser = (req as any).crmUser;
    if (adminUser.id === id) {
      res.status(400).json({ error: "Não é possível excluir seu próprio usuário" }); return;
    }
    const db = await getDb();
    if (!db) { res.status(500).json({ error: "Banco indisponível" }); return; }
    // Desativar em vez de deletar para preservar histórico
    await db.update(crmUsers).set({ ativo: 0 }).where(eq(crmUsers.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao excluir usuário" });
  }
});

// ── POST /api/crm-auth/convites ───────────────────────────────────────────
// Gera um convite e envia por e-mail

router.post("/convites", requireCrmAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).crmUser;
    const { email, nome, role, regioes, origin } = req.body as {
      email?: string;
      nome?: string;
      role?: string;
      regioes?: string[];
      origin?: string;
    };

    if (!email) { res.status(400).json({ error: "E-mail é obrigatório" }); return; }

    // Verificar se e-mail já está cadastrado
    const existente = await buscarUsuarioPorEmail(email);
    if (existente) { res.status(409).json({ error: "E-mail já possui conta ativa" }); return; }

    const db = await getDb();
    if (!db) { res.status(500).json({ error: "Banco indisponível" }); return; }

    // Gerar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const roleValido = ["admin", "vendedor", "comercial", "tecnico"].includes(role ?? "") ? role as any : "vendedor";
    const regioesJson = regioes && regioes.length > 0 ? JSON.stringify(regioes) : null;
    // Salvar convitee
    await db.insert(crmConvites).values({
      token,
      email: email.toLowerCase().trim(),
      nome: nome ?? null,
      role: roleValido,
      regioes: regioesJson,
      criadoPorId: admin.id,
      expiresAt,
    });

    // Montar URL de ativação
    const baseUrl = origin ?? `${req.protocol}://${req.get("host")}`;
    const activationUrl = `${baseUrl}/ativar-conta?token=${token}`;

    // Enviar e-mail de convite
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "email.locaweb.com.br",
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        family: 4, // Force IPv4
      } as any);

      const fromName = process.env.SMTP_FROM_NAME || "BG Service CRM";
      const fromEmail = process.env.SMTP_USER || "comercial2@bgservice.com.br";

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: "Convite para o CRM BG Service",
        html: buildConviteHtml(nome ?? email, activationUrl, admin.nome, expiresAt),
      });

      res.json({ success: true, emailEnviado: true, token });
    } catch (emailErr: any) {
      // Convite criado mas e-mail falhou — retornar link para o admin copiar
      console.error("[Convite] Falha ao enviar e-mail:", emailErr?.message);
      res.json({ success: true, emailEnviado: false, token, activationUrl });
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao criar convite" });
  }
});

// ── GET /api/crm-auth/convites ────────────────────────────────────────────

router.get("/convites", requireCrmAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) { res.json([]); return; }
    const lista = await db
      .select()
      .from(crmConvites)
      .orderBy(crmConvites.createdAt);
    res.json(lista.map(c => ({
      ...c,
      usado: !!c.usedAt,
      expirado: new Date(c.expiresAt) < new Date() && !c.usedAt,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao listar convites" });
  }
});

// ── DELETE /api/crm-auth/convites/:id ────────────────────────────────────

router.delete("/convites/:id", requireCrmAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const db = await getDb();
    if (!db) { res.status(500).json({ error: "Banco indisponível" }); return; }
    await db.delete(crmConvites).where(eq(crmConvites.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao excluir convite" });
  }
});

// ── GET /api/crm-auth/convites/verificar/:token ───────────────────────────
// Rota pública para verificar se token é válido

router.get("/convites/verificar/:token", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) { res.status(500).json({ error: "Banco indisponível" }); return; }

    const rows = await db
      .select()
      .from(crmConvites)
      .where(
        and(
          eq(crmConvites.token, req.params.token),
          gt(crmConvites.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!rows[0]) {
      res.status(404).json({ error: "Convite inválido ou expirado" }); return;
    }

    const convite = rows[0];
    if (convite.usedAt) {
      res.status(410).json({ error: "Este convite já foi utilizado" }); return;
    }

    res.json({
      email: convite.email,
      nome: convite.nome,
      role: convite.role,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao verificar convite" });
  }
});

// ── POST /api/crm-auth/convites/ativar ────────────────────────────────────
// Rota pública para ativar conta com token

router.post("/convites/ativar", async (req: Request, res: Response) => {
  try {
    const { token, nome, senha } = req.body as {
      token?: string;
      nome?: string;
      senha?: string;
    };

    if (!token || !senha) {
      res.status(400).json({ error: "Token e senha são obrigatórios" }); return;
    }
    if (senha.length < 6) {
      res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" }); return;
    }

    const db = await getDb();
    if (!db) { res.status(500).json({ error: "Banco indisponível" }); return; }

    const rows = await db
      .select()
      .from(crmConvites)
      .where(
        and(
          eq(crmConvites.token, token),
          gt(crmConvites.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!rows[0]) {
      res.status(404).json({ error: "Convite inválido ou expirado" }); return;
    }

    const convite = rows[0];
    if (convite.usedAt) {
      res.status(410).json({ error: "Este convite já foi utilizado" }); return;
    }

    // Verificar se e-mail já está cadastrado
    const existente = await buscarUsuarioPorEmail(convite.email);
    if (existente) {
      // Marcar convite como usado mesmo assim
      await db.update(crmConvites).set({ usedAt: new Date() }).where(eq(crmConvites.id, convite.id));
      res.status(409).json({ error: "E-mail já possui conta ativa" }); return;
    }

    // Criar usuário
    const nomeUsuario = nome?.trim() || convite.nome || convite.email.split("@")[0];
    await criarUsuario({
      nome: nomeUsuario,
      email: convite.email,
      senha,
      role: convite.role,
      regioes: convite.regioes,
    });

    // Marcar convite como usado
    await db.update(crmConvites).set({ usedAt: new Date() }).where(eq(crmConvites.id, convite.id));

    // Fazer login automático
    const user = await buscarUsuarioPorEmail(convite.email);
    if (user) {
      await atualizarUltimoLogin(user.id);
      const jwtToken = await criarToken(user);
      const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
      res.cookie(COOKIE, jwtToken, cookieOptions(secure));
      res.json({ success: true, id: user.id, nome: user.nome, email: user.email, role: user.role });
    } else {
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro ao ativar conta" });
  }
});

// ── Template HTML do e-mail de convite ───────────────────────────────────

function buildConviteHtml(nomeConvidado: string, activationUrl: string, nomeAdmin: string, expiresAt: Date): string {
  const dataExpiracao = expiresAt.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Convite CRM BG Service</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:#cc0000;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">BG Service CRM</h1>
          <p style="margin:8px 0 0;color:#ffcccc;font-size:14px;">Sistema de Gestão de Prospecção</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px;">Você foi convidado!</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Olá, <strong>${nomeConvidado}</strong>!<br><br>
            <strong>${nomeAdmin}</strong> convidou você para acessar o CRM da BG Service.
            Clique no botão abaixo para criar sua senha e ativar sua conta.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${activationUrl}" style="background:#cc0000;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">
              Ativar Minha Conta
            </a>
          </div>
          <p style="margin:0 0 8px;color:#888;font-size:13px;">
            Ou copie e cole este link no seu navegador:
          </p>
          <p style="margin:0 0 24px;color:#cc0000;font-size:12px;word-break:break-all;">
            ${activationUrl}
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            Este convite expira em <strong>${dataExpiracao}</strong>.<br>
            Se você não esperava este e-mail, pode ignorá-lo com segurança.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:12px;">BG Service / Machine Elevator &copy; ${new Date().getFullYear()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default router;

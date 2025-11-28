from flask import Flask, request, jsonify, render_template, session, redirect
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import numpy as np
import os
import sqlite3

# -----------------------------------------------------
# CONFIG
# -----------------------------------------------------
APP_HOST = "127.0.0.1"
APP_PORT = 5000
DEBUG = True

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------------------------------
# FLASK
# -----------------------------------------------------
app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "MINHA_CHAVE_SUPER_SECRETA_2025"
CORS(app, supports_credentials=True)

# -----------------------------------------------------
# SQLALCHEMY
# -----------------------------------------------------
DB_PATH = os.path.join(BASE_DIR, "banco.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
Base = declarative_base()

# -----------------------------------------------------
# MODELS
# -----------------------------------------------------

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    senha = Column(String, nullable=False)
    admin = Column(Boolean, default=False)
    bloqueado = Column(Boolean, default=False)
    foto = Column(String, nullable=True)


class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False, unique=True)


class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    descricao = Column(Text, default="")
    preco = Column(Float, nullable=False)
    estoque = Column(Integer, default=0)
    imagem = Column(String, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    categoria = relationship("Categoria")


class CarrinhoItem(Base):
    __tablename__ = "carrinho_items"
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Integer, default=1)
    produto = relationship("Produto")
    usuario = relationship("Usuario")


class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    total = Column(Float)


class PedidoItem(Base):
    __tablename__ = "pedido_itens"
    id = Column(Integer, primary_key=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Integer)
    preco_unitario = Column(Float)

    pedido = relationship("Pedido")
    produto = relationship("Produto")


# -----------------------------------------------------
# SESSION MANAGER
# -----------------------------------------------------
@contextmanager
def get_session():
    s = Session()
    try:
        yield s
        s.commit()
    except:
        s.rollback()
        raise
    finally:
        s.close()


# -----------------------------------------------------
# DATABASE SETUP
# -----------------------------------------------------
def ensure_db():
    Base.metadata.create_all(engine)

    # Garantir coluna de foto no usuário
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(usuarios);")
        cols = [r[1] for r in cur.fetchall()]
        if "foto" not in cols:
            cur.execute("ALTER TABLE usuarios ADD COLUMN foto TEXT;")
            conn.commit()
        conn.close()
    except:
        pass


ensure_db()

# -----------------------------------------------------
# DEFAULT ADMIN
# -----------------------------------------------------
def create_default_admin():
    with get_session() as s:
        if not s.query(Usuario).filter_by(email="admin@admin.com").first():
            s.add(Usuario(
                nome="Administrador",
                email="admin@admin.com",
                senha=generate_password_hash("admin123"),
                admin=True
            ))


create_default_admin()

# -----------------------------------------------------
# FRONTEND ROUTES
# -----------------------------------------------------
@app.route("/")
def tela_inicial_page():
    return render_template("tela_inicial.html")

@app.route("/tela_inicial")
def tela_inicial_alias():
    return render_template("tela_inicial.html")


@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/cadastro")
def cadastro_page():
    return render_template("Cadastro.html")

@app.route("/pagamento")
def tela_pagamento():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("pagamento.html")


@app.route("/admin")
def admin_page():
    if "user_id" not in session or session.get("admin") is not True:
        return redirect("/")
    return render_template("Admin.html")

@app.route("/tela_usuario")
def tela_usuario_page():
    return render_template("usuario.html")


@app.route("/produto/<int:id>")
def pagina_produto(id):
    return render_template("produtos.html", produto_id=id)

# -----------------------------------------------------
# AUTH
# -----------------------------------------------------
@app.route("/login", methods=["POST"])
def login():
    dados = request.json or {}

    with get_session() as s:
        user = s.query(Usuario).filter_by(email=dados.get("email")).first()

        if not user or not check_password_hash(user.senha, dados.get("senha")):
            return jsonify({"error": "Login inválido"}), 400

        if user.bloqueado:
            return jsonify({"error": "Conta bloqueada"}), 403

        session["user_id"] = user.id
        session["admin"] = user.admin

        return jsonify({"ok": True, "admin": user.admin})


@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.json or {}

    with get_session() as s:
        if s.query(Usuario).filter_by(email=dados["email"]).first():
            return jsonify({"error": "Email já existe"}), 400

        novo = Usuario(
            nome=dados["nome"],
            email=dados["email"],
            senha=generate_password_hash(dados["senha"]),
            admin=False
        )
        s.add(novo)
        s.flush()

        session["user_id"] = novo.id
        session["admin"] = novo.admin

        return jsonify({"message": "Conta criada com sucesso"})


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

# -----------------------------------------------------
# USUÁRIO
# -----------------------------------------------------
@app.route("/usuario", methods=["GET"])
def usuario_logado():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    with get_session() as s:
        u = s.query(Usuario).get(session["user_id"])

        return jsonify({
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "admin": u.admin,
            "foto": f"/static/uploads/{u.foto}" if u.foto else None
        })


@app.route("/usuario", methods=["PUT"])
def atualizar_usuario():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    dados = request.json or {}

    with get_session() as s:
        user = s.query(Usuario).get(session["user_id"])
        user.nome = dados.get("nome", user.nome)
        user.email = dados.get("email", user.email)

        if dados.get("senha"):
            user.senha = generate_password_hash(dados["senha"])

    return jsonify({"message": "Dados atualizados"})


@app.route("/upload_foto", methods=["POST"])
def upload_foto():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    arquivo = request.files.get("foto")
    if not arquivo:
        return jsonify({"error": "Nenhuma imagem"}), 400

    ext = os.path.splitext(arquivo.filename)[1]
    nome_final = secure_filename(f"user_{session['user_id']}{ext}")
    caminho = os.path.join(UPLOAD_FOLDER, nome_final)
    arquivo.save(caminho)

    with get_session() as s:
        u = s.query(Usuario).get(session["user_id"])
        u.foto = nome_final

    return jsonify({
        "message": "Foto atualizada",
        "foto": f"/static/uploads/{nome_final}"
    })

# -----------------------------------------------------
# ADMIN — GERENCIAMENTO DE USUÁRIOS
# -----------------------------------------------------
def admin_required():
    return "user_id" in session and session.get("admin") is True


@app.route("/admin/usuarios", methods=["GET"])
def listar_usuarios_admin():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        users = s.query(Usuario).all()

        return jsonify([
            {
                "id": u.id,
                "nome": u.nome,
                "email": u.email,
                "admin": u.admin,
                "bloqueado": u.bloqueado
            }
            for u in users
        ])


@app.route("/admin/usuarios/<int:id>", methods=["GET"])
def pegar_usuario_admin(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        u = s.query(Usuario).get(id)
        if not u:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "admin": u.admin,
            "bloqueado": u.bloqueado
        })


@app.route("/admin/usuarios/<int:id>", methods=["PUT"])
def editar_usuario_admin(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    dados = request.json or {}

    with get_session() as s:
        u = s.query(Usuario).get(id)
        if not u:
            return jsonify({"error": "Usuário não encontrado"}), 404

        u.nome = dados.get("nome", u.nome)
        u.email = dados.get("email", u.email)
        u.admin = dados.get("admin", u.admin)
        u.bloqueado = dados.get("bloqueado", u.bloqueado)

        if dados.get("senha"):
            u.senha = generate_password_hash(dados["senha"])

    return jsonify({"message": "Usuário atualizado"})


@app.route("/admin/usuarios/<int:id>/bloquear", methods=["PUT"])
def bloquear_usuario(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        u = s.query(Usuario).get(id)
        if not u:
            return jsonify({"error": "Usuário não existe"}), 404

        u.bloqueado = not u.bloqueado

    return jsonify({
        "message": "Status alterado",
        "bloqueado": u.bloqueado
    })


@app.route("/admin/usuarios/<int:id>", methods=["DELETE"])
def remover_usuario(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        u = s.query(Usuario).get(id)
        if not u:
            return jsonify({"error": "Usuário não existe"}), 404

        s.delete(u)

    return jsonify({"message": "Usuário removido"})

# -----------------------------------------------------
# DASHBOARD
# -----------------------------------------------------
@app.route("/admin/dashboard/resumo", methods=["GET"])
def dashboard_resumo():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        total_usuarios = s.query(Usuario).count()
        total_produtos = s.query(Produto).count()
        total_pedidos = s.query(Pedido).count()
        faturamento = sum(p.total for p in s.query(Pedido).all())

    return jsonify({
        "usuarios": total_usuarios,
        "produtos": total_produtos,
        "pedidos": total_pedidos,
        "faturado": faturamento
    })


@app.route("/admin/dashboard/grafico_vendas", methods=["GET"])
def dashboard_grafico_vendas():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        pedidos = s.query(Pedido).all()

        labels = [f"Pedido {p.id}" for p in pedidos]
        valores = [float(p.total) for p in pedidos]

    return jsonify({"labels": labels, "values": valores})


@app.route("/admin/dashboard/produtos_mais_vendidos", methods=["GET"])
def produtos_mais_vendidos():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        itens = s.query(PedidoItem).all()

        ranking = {}
        for item in itens:
            nome = item.produto.nome
            ranking[nome] = ranking.get(nome, 0) + item.quantidade

    return jsonify(ranking)

# -----------------------------------------------------
# PREVISÃO DE DEMANDA (REGRESSÃO LINEAR SIMPLES)
# -----------------------------------------------------

@app.route("/admin/previsao/<int:produto_id>", methods=["GET"])
def previsao_demanda(produto_id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        itens = (
            s.query(PedidoItem, Pedido)
            .join(Pedido, PedidoItem.pedido_id == Pedido.id)
            .filter(PedidoItem.produto_id == produto_id)
            .all()
        )

        # Sem vendas → sem previsão
        if not itens:
            return jsonify({"produto_id": produto_id, "erro": "Sem histórico de vendas"})

        # Agrupar vendas por mês
        vendas = {}

        for item, pedido in itens:
            mes = datetime.fromtimestamp(pedido.id).strftime("%Y-%m")  # mes/ano
            vendas[mes] = vendas.get(mes, 0) + item.quantidade

        # Ordenar por data
        meses = sorted(vendas.keys())
        y = np.array([vendas[m] for m in meses])   # vendas
        x = np.arange(len(meses))                  # meses como números inteiros

        # Regressão linear simples
        a, b = np.polyfit(x, y, 1)

        # Previsão para os próximos 3 meses
        previsao = {}
        for i in range(1, 4):
            y_pred = a * (len(x) + i) + b
            previsao[f"+{i}_mes"] = max(0, round(float(y_pred), 2))

        return jsonify({
            "produto_id": produto_id,
            "historico": dict(vendas),
            "tendencia": round(float(a), 4),
            "previsao": previsao
        })


# -----------------------------------------------------
# 🆕 ROTAS DE VENDAS (ADICIONADAS)
# -----------------------------------------------------

@app.route("/admin/vendas/pedidos", methods=["GET"])
def admin_vendas_pedidos():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        pedidos = s.query(Pedido).all()

        return jsonify([
            {
                "id": p.id,
                "usuario": s.query(Usuario).get(p.usuario_id).nome,
                "total": float(p.total)
            }
            for p in pedidos
        ])


@app.route("/admin/vendas/top_produtos", methods=["GET"])
def admin_top_produtos():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        itens = s.query(PedidoItem).all()

        ranking = {}
        for item in itens:
            nome = item.produto.nome
            ranking[nome] = ranking.get(nome, 0) + item.quantidade

        ranking_ordenado = sorted(ranking.items(), key=lambda x: x[1], reverse=True)

    return jsonify([
        {"nome": nome, "quantidade": qtd}
        for nome, qtd in ranking_ordenado
    ])

# -----------------------------------------------------
# PRODUTOS
# -----------------------------------------------------
@app.route("/produtos", methods=["GET"])
def listar_produtos():
    with get_session() as s:
        produtos = s.query(Produto).all()

        return jsonify([
            {
                "id": p.id,
                "nome": p.nome,
                "descricao": p.descricao,
                "preco": float(p.preco),
                "estoque": p.estoque,
                "imagem": f"/static/uploads/{p.imagem}" if p.imagem else None
            }
            for p in produtos
        ])


@app.route("/produtos", methods=["POST"])
def criar_produto():
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    nome = request.form.get("nome")
    descricao = request.form.get("descricao")
    preco = request.form.get("preco")
    estoque = request.form.get("estoque")
    imagem = request.files.get("imagem")

    if not nome or not preco:
        return jsonify({"error": "Nome e preço são obrigatórios"}), 400

    nome_imagem = None

    if imagem:
        ext = os.path.splitext(imagem.filename)[1]
        nome_imagem = secure_filename(f"{nome}_{preco}{ext}")
        imagem.save(os.path.join(UPLOAD_FOLDER, nome_imagem))

    with get_session() as s:
        novo = Produto(
            nome=nome,
            descricao=descricao,
            preco=float(preco),
            estoque=int(estoque or 0),
            imagem=nome_imagem
        )
        s.add(novo)

    return jsonify({"ok": True, "message": "Produto cadastrado com sucesso"})


@app.route("/produtos/<int:id>", methods=["GET"])
def produto(id):
    with get_session() as s:
        p = s.query(Produto).get(id)
        return jsonify({
            "id": p.id,
            "nome": p.nome,
            "descricao": p.descricao,
            "preco": float(p.preco),
            "estoque": p.estoque,
            "imagem": f"/static/uploads/{p.imagem}" if p.imagem else None
        })


@app.route("/produtos/<int:id>", methods=["PUT"])
def editar_produto(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    form = request.form
    imagem = request.files.get("imagem")

    with get_session() as s:
        p = s.query(Produto).get(id)

        p.nome = form.get("nome", p.nome)
        p.descricao = form.get("descricao", p.descricao)
        p.preco = float(form.get("preco", p.preco))
        p.estoque = int(form.get("estoque", p.estoque))

        if imagem:
            ext = os.path.splitext(imagem.filename)[1]
            nome_imagem = secure_filename(f"{p.nome}_{p.preco}{ext}")
            imagem.save(os.path.join(UPLOAD_FOLDER, nome_imagem))
            p.imagem = nome_imagem

    return jsonify({"message": "Produto atualizado"})


@app.route("/produtos/<int:id>", methods=["DELETE"])
def excluir_produto(id):
    if not admin_required():
        return jsonify({"error": "Acesso negado"}), 403

    with get_session() as s:
        p = s.query(Produto).get(id)
        if not p:
            return jsonify({"error": "Produto não encontrado"}), 404

        s.delete(p)

    return jsonify({"message": "Produto removido"})

# -----------------------------------------------------
# CARRINHO
# -----------------------------------------------------
@app.route("/carrinho", methods=["GET"])
def listar_carrinho():
    if "user_id" not in session:
        return jsonify([])

    with get_session() as s:
        itens = s.query(CarrinhoItem).filter_by(usuario_id=session["user_id"]).all()

        return jsonify([
            {
                "produto_id": i.produto.id,
                "nome": i.produto.nome,
                "preco": float(i.produto.preco),
                "quantidade": i.quantidade,
                "imagem": f"/static/uploads/{i.produto.imagem}" if i.produto.imagem else None
            }
            for i in itens
        ])


@app.route("/carrinho", methods=["POST"])
def adicionar_ao_carrinho():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    dados = request.json or {}
    produto_id = dados.get("produto_id")
    quantidade = dados.get("quantidade", 1)

    with get_session() as s:
        item = s.query(CarrinhoItem).filter_by(
            usuario_id=session["user_id"],
            produto_id=produto_id
        ).first()

        if item:
            item.quantidade += quantidade
        else:
            novo = CarrinhoItem(
                usuario_id=session["user_id"],
                produto_id=produto_id,
                quantidade=quantidade
            )
            s.add(novo)

    return jsonify({"message": "Adicionado com sucesso"})

@app.route("/carrinho/quantidade", methods=["PUT"])
def alterar_quantidade():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    dados = request.json or {}
    produto_id = dados.get("produto_id")
    delta = dados.get("quantidade", 0)  # +1 ou -1

    with get_session() as s:
        item = s.query(CarrinhoItem).filter_by(
            usuario_id=session["user_id"],
            produto_id=produto_id
        ).first()

        if not item:
            return jsonify({"error": "Item não encontrado"}), 404

        item.quantidade += delta

        if item.quantidade <= 0:
            s.delete(item)
            return jsonify({"message": "Item removido"})

    return jsonify({"message": "Quantidade atualizada"})

@app.route("/carrinho/<int:produto_id>", methods=["DELETE"])
def remover_do_carrinho(produto_id):
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    with get_session() as s:
        item = s.query(CarrinhoItem).filter_by(
            usuario_id=session["user_id"],
            produto_id=produto_id
        ).first()

        if not item:
            return jsonify({"error": "Item não encontrado"}), 404

        s.delete(item)

    return jsonify({"message": "Item removido"})




# -----------------------------------------------------
# CHECKOUT
# -----------------------------------------------------
@app.route("/checkout", methods=["POST"])
def checkout():
    if "user_id" not in session:
        return jsonify({"error": "Não autenticado"}), 401

    with get_session() as s:
        itens = s.query(CarrinhoItem).filter_by(usuario_id=session["user_id"]).all()

        if not itens:
            return jsonify({"error": "Carrinho vazio"}), 400

        total = sum(i.produto.preco * i.quantidade for i in itens)

        novo_pedido = Pedido(usuario_id=session["user_id"], total=total)
        s.add(novo_pedido)
        s.flush()

        for item in itens:
            s.add(PedidoItem(
                pedido_id=novo_pedido.id,
                produto_id=item.produto_id,
                quantidade=item.quantidade,
                preco_unitario=item.produto.preco
            ))

            item.produto.estoque -= item.quantidade
            s.delete(item)

    return jsonify({"message": "Pedido finalizado", "total": total})

# -----------------------------------------------------
# PEDIDOS
# -----------------------------------------------------
@app.route("/pedidos", methods=["GET"])
def pedidos():
    if "user_id" not in session:
        return jsonify([])

    with get_session() as s:
        pedidos = s.query(Pedido).filter_by(usuario_id=session["user_id"]).all()

        return jsonify([
            {"id": p.id, "total": float(p.total)}
            for p in pedidos
        ])

# -----------------------------------------------------
# RUN
# -----------------------------------------------------
if __name__ == "__main__":
    print(f"Rodando em http://{APP_HOST}:{APP_PORT}")
    app.run(host=APP_HOST, port=APP_PORT, debug=DEBUG)

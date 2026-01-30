
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];


const nomeInput = document.getElementById("nomeProduto");
const quantidadeInput = document.getElementById("quantidadeProduto");
const btnAdicionar = document.getElementById("btnAdicionar");
const tabelaProdutos = document.getElementById("tabelaProdutos");
const buscaProduto = document.getElementById("buscaProduto");
const totalProdutosEl = document.getElementById("totalProdutos");
const totalBaixoEl = document.getElementById("totalBaixo");
const totalItensEl = document.getElementById("totalItens");
const btnExportar = document.getElementById("btnExportar");
const btnLimpar = document.getElementById("btnLimpar");

btnExportar.addEventListener("click", exportarCSV);
btnLimpar.addEventListener("click", limparEstoque);


buscaProduto.addEventListener("input", renderizarTabela);


btnAdicionar.addEventListener("click", adicionarProduto);


renderizarTabela();

function adicionarProduto() {
    const nome = nomeInput.value;
    const quantidade = quantidadeInput.value;

    if (nome === "" || quantidade === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const existe = produtos.some(
        p => p.nome.toLowerCase() === nome.toLowerCase()
    );

    if (existe) {
        alert("Esse produto já existe! Use Editar ou ajuste com + / -.");
        return;
    }

    const produto = {
        nome: nome,
        quantidade: Number(quantidade)
    };

    produtos.push(produto);
    salvarDados();
    renderizarTabela();

    nomeInput.value = "";
    quantidadeInput.value = "";
}


function renderizarTabela() {
    tabelaProdutos.innerHTML = "";

    const termo = buscaProduto.value.toLowerCase().trim();

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(termo)
    );

    // Dashboard
    totalProdutosEl.textContent = produtos.length;

    const totalBaixo = produtos.filter(p => p.quantidade < 5).length;
    totalBaixoEl.textContent = totalBaixo;

    const totalItens = produtos.reduce((acc, p) => acc + p.quantidade, 0);
    totalItensEl.textContent = totalItens;

    // Render
    produtosFiltrados.forEach((produto, indexFiltrado) => {
        // precisamos achar o index real no array original:
        const indexReal = produtos.indexOf(produto);
        const classeEstoque = produto.quantidade < 5 ? "baixo" : "ok";

        tabelaProdutos.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td class="${classeEstoque}">${produto.quantidade}</td>
                <td>
                    <button onclick="entradaEstoque(${indexReal})">+</button>
                    <button onclick="saidaEstoque(${indexReal})">-</button>
                    <button onclick="editarProduto(${indexReal})">Editar</button>
                    <button onclick="removerProduto(${indexReal})">Remover</button>
                </td>
            </tr>
        `;
    });
}





function removerProduto(index) {
    produtos.splice(index, 1);
    salvarDados();
    renderizarTabela();
}

function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function entradaEstoque(index) {
    produtos[index].quantidade++;
    salvarDados();
    renderizarTabela();
}

function saidaEstoque(index) {
    if (produtos[index].quantidade > 0) {
        produtos[index].quantidade--;
        salvarDados();
        renderizarTabela();
    } else {
        alert("Quantidade não pode ser negativa!");
    }
}

function editarProduto(index) {
    const novoNome = prompt("Novo nome do produto:", produtos[index].nome);
    if (novoNome === null) return; // cancelou
    if (novoNome.trim() === "") {
        alert("Nome inválido!");
        return;
    }

    const novaQuantidadeStr = prompt("Nova quantidade:", produtos[index].quantidade);
    if (novaQuantidadeStr === null) return; // cancelou

    const novaQuantidade = Number(novaQuantidadeStr);
    if (Number.isNaN(novaQuantidade) || novaQuantidade < 0) {
        alert("Quantidade inválida!");
        return;
    }

    produtos[index].nome = novoNome.trim();
    produtos[index].quantidade = novaQuantidade;

    salvarDados();
    renderizarTabela();
}

function limparEstoque() {
    const confirmar = confirm("Tem certeza que deseja apagar todos os produtos?");
    if (!confirmar) return;

    produtos = [];
    salvarDados();
    renderizarTabela();
}

function exportarCSV() {
    if (produtos.length === 0) {
        alert("Não há produtos para exportar.");
        return;
    }

    const cabecalho = ["Produto", "Quantidade"];
    const linhas = produtos.map(p => [p.nome, p.quantidade]);

    const csv = [cabecalho, ...linhas]
        .map(l => l.join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "estoque.csv";
    link.click();

    URL.revokeObjectURL(url);
}


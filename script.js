// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================
// Aqui selecionamos o elemento HTML onde os cards serão desenhados.
// 'document.querySelector' busca o primeiro elemento que tem a classe ".card-container".
let cardContainer = document.querySelector(".card-container");

// Esta variável 'dados' vai guardar a lista de tecnologias que carregaremos do arquivo 'data.json'.
// Começa como um array vazio [].
let dados = [];

// ============================================================================
// ESTADO DA APLICAÇÃO
// ============================================================================
// O objeto 'estado' guarda as configurações atuais da página.
// É como a "memória" do que o usuário está fazendo no momento.
let estado = {
    termoBusca: "",      // O texto que o usuário digitou na busca (começa vazio).
    ordem: "alfa_asc"    // A ordem de exibição atual (padrão: alfabética crescente A-Z).
};

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================
// Esta função busca os dados do arquivo externo 'data.json'.
// 'async' indica que é uma função assíncrona, ou seja, ela espera algo acontecer (o download do arquivo) sem travar a página.
async function carregarDados() {
    try {
        // 'await fetch' vai até o arquivo 'data.json' e espera a resposta.
        let resposta = await fetch("data.json");

        // 'await resposta.json()' converte a resposta (texto) em um objeto JavaScript utilizável.
        dados = await resposta.json();

        // Depois de carregar os dados, chamamos a função que organiza e mostra tudo na tela.
        aplicarFiltrosEOrdenacao();
    } catch (error) {
        // Se algo der errado (ex: arquivo não encontrado), mostra o erro no console do navegador.
        console.error("Erro ao carregar dados:", error);
    }
}

// ============================================================================
// LÓGICA DE FILTRO E ORDENAÇÃO
// ============================================================================
// Esta é a função "cérebro" da página. Ela pega os dados originais,
// aplica o filtro de busca, ordena conforme a escolha do usuário e manda desenhar.
function aplicarFiltrosEOrdenacao() {
    // Cria uma cópia dos dados originais para não estragar a lista principal.
    // O operador '...' (spread) espalha os itens em um novo array.
    let dadosFiltrados = [...dados];

    // 1. FILTRAR
    // Se houver algo digitado na busca (estado.termoBusca não for vazio)...
    if (estado.termoBusca) {
        // Converte o termo de busca para minúsculas para facilitar a comparação (ex: "Java" vira "java").
        const termo = estado.termoBusca.toLowerCase();

        // .filter() cria uma nova lista apenas com os itens que passam no teste.
        dadosFiltrados = dadosFiltrados.filter(dado =>
            // Verifica se o nome contém o termo...
            dado.nome.toLowerCase().includes(termo) ||
            // ...ou se a descrição contém o termo...
            dado.descricao.toLowerCase().includes(termo) ||
            // ...ou se alguma das tags contém o termo.
            dado.tags.some(tag => tag.toLowerCase().includes(termo))
        );
    }

    // 2. ORDENAR
    // O 'switch' verifica qual é o valor de 'estado.ordem' e decide como organizar a lista.
    switch (estado.ordem) {
        case 'alfa_asc': // Alfabética Crescente (A-Z)
            // .sort() organiza o array. localeCompare compara strings corretamente (considerando acentos).
            dadosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'alfa_desc': // Alfabética Decrescente (Z-A)
            dadosFiltrados.sort((a, b) => b.nome.localeCompare(a.nome));
            break;
        case 'ano_desc': // Ano: Mais recente para mais antigo
            // Subtrair b.data_criacao de a.data_criacao ordena números.
            dadosFiltrados.sort((a, b) => b.data_criacao - a.data_criacao);
            break;
        case 'ano_asc': // Ano: Mais antigo para mais recente
            dadosFiltrados.sort((a, b) => a.data_criacao - b.data_criacao);
            break;
        case 'pop_desc': // Popularidade: Maior para menor
            dadosFiltrados.sort((a, b) => b.popularidade - a.popularidade);
            break;
        case 'pop_asc': // Popularidade: Menor para maior
            dadosFiltrados.sort((a, b) => a.popularidade - b.popularidade);
            break;
    }

    // 3. RENDERIZAR
    // Depois de filtrar e ordenar, chamamos a função que cria o HTML dos cards.
    renderizarCards(dadosFiltrados);
}

// ============================================================================
// RENDERIZAÇÃO (DESENHAR NA TELA)
// ============================================================================
// Esta função recebe a lista de dados já processada e cria os elementos HTML para cada item.
function renderizarCards(dadosParaRenderizar) {
    // Limpa o conteúdo atual do container. Se não fizermos isso, os novos cards seriam adicionados embaixo dos antigos.
    cardContainer.innerHTML = "";

    // Atualiza o texto que diz "X resultados encontrados".
    const searchInfo = document.getElementById('search-info');

    if (estado.termoBusca) {
        // Se tem busca, mostra a mensagem com a contagem.
        // Usamos template string (crase `) para inserir variáveis no texto.
        searchInfo.textContent = `"${estado.termoBusca}" - ${dadosParaRenderizar.length} resultado${dadosParaRenderizar.length !== 1 ? 's' : ''} encontrado${dadosParaRenderizar.length !== 1 ? 's' : ''}`;
        searchInfo.style.display = 'block'; // Torna visível
    } else {
        // Se não tem busca, esconde essa mensagem.
        searchInfo.style.display = 'none';
    }

    // Verifica se a lista está vazia (nenhum resultado encontrado).
    if (dadosParaRenderizar.length === 0) {
        const mensagem = document.createElement('p');
        mensagem.textContent = "Nenhum resultado encontrado.";
        // Estiliza a mensagem de erro diretamente via JS
        mensagem.style.textAlign = "center";
        mensagem.style.width = "100%";
        mensagem.style.color = "var(--text-color)";
        cardContainer.appendChild(mensagem);
        return; // Para a execução da função aqui.
    }

    // Lista de classes de cores para as tags (definidas no CSS).
    const tagColors = ['tag-color-1', 'tag-color-2', 'tag-color-3', 'tag-color-4', 'tag-color-5'];

    // Loop: Para cada 'dado' na lista 'dadosParaRenderizar'...
    for (let dado of dadosParaRenderizar) {
        // Cria o elemento principal do card (<article>).
        let article = document.createElement("article");
        article.classList.add("card"); // Adiciona a classe CSS "card".

        // Cria uma div para agrupar o conteúdo de texto.
        const divContent = document.createElement('div');

        // Cria o título do card (<h2>).
        const h2 = document.createElement('h2');
        h2.textContent = dado.nome; // Define o texto do título com o nome da tecnologia.

        // Cria o parágrafo do ano.
        const pAno = document.createElement('p');
        const strongAno = document.createElement('strong');
        strongAno.textContent = "Ano de Criação: ";
        pAno.appendChild(strongAno); // Coloca o negrito dentro do parágrafo.
        pAno.appendChild(document.createTextNode(dado.data_criacao)); // Adiciona o ano.

        // Cria a descrição.
        const pDesc = document.createElement('p');
        pDesc.textContent = dado.descricao;

        // Cria o container para as tags (etiquetas coloridas).
        const divTags = document.createElement('div');
        divTags.classList.add('tags-container');

        // Loop: Para cada 'tag' dentro da lista de tags deste dado...
        dado.tags.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add('tag');

            // Escolhe uma cor aleatória da lista 'tagColors'.
            const randomColorClass = tagColors[Math.floor(Math.random() * tagColors.length)];
            span.classList.add(randomColorClass);

            span.textContent = tag;

            // Torna a tag clicável para filtrar por ela.
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
                buscarPorTag(tag); // Chama a função de busca específica ao clicar.
            });

            divTags.appendChild(span); // Adiciona a tag ao container de tags.
        });

        // Monta a estrutura do card: coloca título, ano, descrição e tags dentro da div de conteúdo.
        divContent.appendChild(h2);
        divContent.appendChild(pAno);
        divContent.appendChild(pDesc);
        divContent.appendChild(divTags);

        // Cria o link "Website".
        const link = document.createElement('a');
        link.href = dado.link; // Define o destino do link.
        link.target = "_blank"; // Abre em nova aba.
        link.rel = "noopener noreferrer"; // Medida de segurança para links externos.
        link.textContent = "Website";

        // Adiciona o conteúdo e o link ao card principal.
        article.appendChild(divContent);
        article.appendChild(link);

        // Finalmente, adiciona o card completo à página (dentro do cardContainer).
        cardContainer.appendChild(article);
    }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
// Função chamada quando o usuário clica em uma tag.
function buscarPorTag(tag) {
    const inputBusca = document.querySelector("#input-busca");
    inputBusca.value = tag; // Preenche o campo de busca com o nome da tag.
    estado.termoBusca = tag; // Atualiza o estado da busca.
    aplicarFiltrosEOrdenacao(); // Refaz a filtragem.

    // Rola a página suavemente para o topo para ver os resultados.
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// INICIALIZAÇÃO E EVENTOS
// ============================================================================
// 'DOMContentLoaded' garante que o código só rode depois que todo o HTML estiver carregado.
document.addEventListener('DOMContentLoaded', () => {
    // Carrega os dados iniciais.
    carregarDados();

    // Seleciona os elementos de controle da interface.
    const inputBusca = document.querySelector("#input-busca");
    const botaoBusca = document.querySelector("#botao-busca");
    const searchIcon = document.querySelector(".search-icon");
    const selectOrdenar = document.querySelector("#select-ordenar");
    const themeToggle = document.querySelector("#theme-toggle");
    const headerTitle = document.querySelector("header h1");

    // --- Configuração da Busca ---
    function atualizarBusca() {
        estado.termoBusca = inputBusca.value; // Pega o que foi digitado.
        aplicarFiltrosEOrdenacao(); // Atualiza a tela.
    }
    // Adiciona o evento de clique ao botão "Buscar".
    botaoBusca.addEventListener('click', atualizarBusca);
    // Adiciona o evento de clique ao ícone de lupa.
    searchIcon.addEventListener('click', atualizarBusca);
    // Permite buscar apertando "Enter" no teclado.
    inputBusca.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') atualizarBusca();
    });

    // --- Configuração da Ordenação ---
    // O evento 'change' dispara quando o usuário muda a opção do select.
    selectOrdenar.addEventListener('change', () => {
        estado.ordem = selectOrdenar.value;
        aplicarFiltrosEOrdenacao();
    });

    // --- Configuração do Tema (Claro/Escuro) ---
    const sunIcon = document.querySelector(".icon-sun");
    const moonIcon = document.querySelector(".icon-moon");

    // Verifica se o usuário já tinha escolhido um tema antes (salvo no navegador).
    const currentTheme = localStorage.getItem("theme");

    // Função que aplica o tema visualmente.
    function setTheme(theme) {
        if (theme === "dark") {
            // Adiciona o atributo data-theme="dark" ao body (o CSS usa isso para mudar as cores).
            document.body.setAttribute("data-theme", "dark");
            sunIcon.style.display = "none"; // Esconde o sol.
            moonIcon.style.display = "inline-block"; // Mostra a lua.
            localStorage.setItem("theme", "dark"); // Salva a preferência.
        } else {
            document.body.removeAttribute("data-theme"); // Remove o atributo (volta ao padrão claro).
            sunIcon.style.display = "inline-block"; // Mostra o sol.
            moonIcon.style.display = "none"; // Esconde a lua.
            localStorage.removeItem("theme");
        }
    }

    // Se havia um tema salvo, aplica ele ao iniciar.
    if (currentTheme) {
        setTheme(currentTheme);
    }

    // Alterna o tema ao clicar no botão.
    themeToggle.addEventListener("click", () => {
        let theme = document.body.getAttribute("data-theme");
        // Se estava escuro, vira claro. Se estava claro (null), vira escuro.
        setTheme(theme === "dark" ? "light" : "dark");
    });

    // --- Scroll para o topo ---
    // Ao clicar no título "DevTec", volta para o topo da página.
    headerTitle.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
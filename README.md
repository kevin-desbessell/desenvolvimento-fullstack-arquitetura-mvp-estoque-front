# Frontend - Controle de Estoque

Frontend de uma aplicação web simples para gerenciamento de estoque de uma loja de materiais de construção.

Este projeto foi desenvolvido como parte do MVP acadêmico da pós-graduação em Desenvolvimento Full Stack da PUC - Rio. O frontend foi construído como uma **SPA (Single Page Application)** utilizando apenas **HTML**, **CSS** e **JavaScript puro**, sem frameworks, atendendo aos requisitos do projeto.

A aplicação permite cadastrar, listar, editar e excluir produtos, além de alternar a visualização entre **cards** e **lista**, consumindo todas as rotas disponíveis no backend.

---

## Objetivo do projeto

Este frontend foi criado para servir como interface visual do sistema de controle de estoque.

O objetivo é oferecer uma experiência simples, clara e funcional para manipulação dos produtos cadastrados no backend, com foco em:

- organização visual
- responsividade
- simplicidade de uso
- integração completa com a API
- estrutura leve, sem necessidade de instalação de dependências

---

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Integração com API Flask

---

## Funcionalidades

A aplicação permite:

- cadastrar novos produtos
- listar produtos cadastrados
- visualizar produtos em formato de **cards**
- visualizar produtos em formato de **lista**
- editar produtos
- excluir produtos
- exibir mensagens de sucesso e erro
- funcionar como SPA em uma única página
- abrir diretamente pelo arquivo `index.html`, sem necessidade de extensões ou servidores locais

---

## Estrutura do projeto

```txt
estoque-front/
├── index.html
├── styles.css
├── script.js
├── README.md
├── .gitignore
```

---

## Descrição dos arquivos

- **index.html**: estrutura principal da aplicação
- **styles.css**: estilos visuais, layout e responsividade
- **script.js**: lógica da aplicação, integração com o backend e manipulação da interface
- **README.md**: documentação do projeto
- **.gitignore**: arquivos e pastas que não devem ser enviados ao GitHub

---

## Como executar o projeto

Este frontend não precisa de instalação de dependências.

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd estoque-front
```

> Substitua `URL_DO_REPOSITORIO` pela URL real do repositório do frontend no GitHub.

---

### 2. Garantir que o backend esteja rodando

Antes de abrir o frontend, o backend deve estar em execução.

Por padrão, o frontend está configurado para consumir a API neste endereço:

```txt
http://127.0.0.1:5000
```

---

### 3. Abrir o arquivo `index.html`

Você pode abrir o projeto diretamente no navegador, sem instalação adicional.

#### Windows
- clique duas vezes no arquivo `index.html`
- ou clique com o botão direito e escolha abrir com o navegador

#### macOS
- clique duas vezes no arquivo `index.html`
- ou abra manualmente pelo navegador

#### Linux
- abra o arquivo `index.html` diretamente no navegador de sua preferência

---

## Observação importante sobre execução

Este projeto foi desenvolvido para funcionar **sem Live Server**, **sem servidor local de frontend** e **sem frameworks**.

Ou seja, basta:

- deixar o backend rodando
- abrir o `index.html` diretamente no navegador

---

## Observação sobre comunicação com o backend

Para garantir o funcionamento correto do frontend mesmo quando o arquivo `index.html` é aberto diretamente no navegador, o backend foi configurado com CORS para permitir a comunicação local com a API.

Isso permite que o frontend funcione tanto:

- abrindo o arquivo `index.html` diretamente no navegador
- quanto por um servidor local, como o Live Server

Desde que o backend esteja em execução em:

`http://127.0.0.1:5000`

---

## Integração com o backend

O frontend consome a API através da constante definida no arquivo `script.js`:

```javascript
const API_BASE_URL = "http://127.0.0.1:5000";
```

Se o backend estiver rodando em outra porta ou endereço, basta alterar esse valor.

---

## Rotas do backend utilizadas

O frontend utiliza todas as rotas principais da API:

| Método | Rota              | Finalidade no frontend |
|--------|-------------------|------------------------|
| GET    | `/produtos`       | carregar todos os produtos |
| POST   | `/produtos`       | cadastrar um novo produto |
| GET    | `/produtos/{id}`  | buscar um produto específico para edição |
| PUT    | `/produtos/{id}`  | atualizar um produto existente |
| DELETE | `/produtos/{id}`  | excluir um produto |

---

## Como a aplicação funciona

### Cadastro
O usuário preenche o formulário e envia os dados para o backend usando `POST`.

### Listagem
Ao carregar a página, a aplicação busca todos os produtos cadastrados usando `GET /produtos`.

### Edição
Ao clicar em **Editar**, a aplicação busca os dados completos do item usando `GET /produtos/{id}` e preenche o formulário para alteração.

### Atualização
Após editar, o formulário envia os novos dados usando `PUT /produtos/{id}`.

### Exclusão
Ao clicar em **Excluir**, a aplicação envia uma requisição `DELETE /produtos/{id}` e atualiza a interface.

### Alternância de visualização
O usuário pode alternar entre:

- **Cards**
- **Lista**

sem sair da mesma página.

---

## Responsividade

O frontend foi ajustado para se adaptar a diferentes tamanhos de tela.

### Comportamento responsivo implementado

- layout em cards ajustado para telas pequenas
- formulário adaptado para uma coluna em telas menores
- tabela transformada em blocos responsivos abaixo de 900px
- ajustes específicos para telas de 480px e 350px ou menores

---

## Exemplo de JSON enviado ao backend

```json
{
  "nome": "Cimento CP II",
  "categoria": "Cimento",
  "quantidade": 100,
  "unidade": "saco",
  "preco": 42.9,
  "descricao": "Saco de 50kg"
}
```

---

## Estrutura visual da página

A interface foi organizada em três áreas principais:

### 1. Cabeçalho
Exibe o título do sistema e uma breve descrição.

### 2. Formulário
Usado tanto para cadastro quanto para edição de produtos.

### 3. Área de produtos
Responsável por renderizar os itens cadastrados em modo de cards ou lista.

---

## Boas práticas aplicadas

Este frontend foi desenvolvido com foco em:

- separação entre estrutura, estilo e comportamento
- uso de JavaScript puro
- consumo completo da API
- interface simples e objetiva
- código comentado e organizado
- responsividade para diferentes dispositivos

---

## Não utilização de frameworks

Conforme os requisitos do projeto:

- não foi utilizado framework frontend
- não foi utilizada biblioteca JavaScript externa
- a aplicação funciona apenas com HTML, CSS e JavaScript puro

---

## Requisitos atendidos

Este frontend atende aos seguintes pontos do projeto:

- SPA com HTML, CSS e JavaScript
- exibição em lista ou cards
- chamadas para todas as rotas do backend
- sem uso de framework frontend
- funciona ao abrir o `index.html` diretamente no navegador
- estrutura simples e organizada

---

## Autor

Projeto desenvolvido por **Kevin Desbessell** como atividade acadêmica do curso de pós-graduação em **Desenvolvimento Full Stack** da Universidade PUC - Rio.
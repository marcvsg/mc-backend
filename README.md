
## MC - Backend & Sistema

Este projeto foi feito em electron | node

O principal objetivo deste sistema é gerenciar de forma prática o cadastro de clientes e o registro dos serviços realizados, garantindo organização, rapidez e fácil acesso às informações essenciais para o negócio.

### Como funciona?
É um sistema simples e prático, desenvolvido para iniciar automaticamente junto ao Windows e armazenar todos os dados localmente na máquina, dispensando a necessidade de conexão com a internet.

O administrador do sistema terá a dever de preencher todos os dados do cliente, e assim que ele cadastrar o cliente. O backend do sistema irá entrar em ação e enviará os dados cadastrados ao banco de dados.

A tabela é bem prática, segue abaixo:

| Campo           | Tipo     | Tamanho | Descrição                  |
|-----------------|----------|---------|----------------------------|
| nome_cliente    | VARCHAR  | 100     | Nome completo do cliente   |
| email_cliente   | VARCHAR  | 150     | Endereço de e-mail         |
| telefone_cliente| VARCHAR  | 20      | Telefone para contato      |
| endereco_cliente| VARCHAR  | 200     | Endereço completo          |
| cidade_cliente  | VARCHAR  | 100     | Cidade de residência       |
| data            | VARCHAR  | 20      | Data do registro/serviço   |
| hora            | VARCHAR  | 10      | Horário do registro/serviço|

### Ela será disponibilizada junto com a pasta raíz.
#### Obs: A tabela está com usuário 'root' e senha 'root', por favor mudar quando for utilizar o sistema.

## Estrutura do Projeto

```
MC/
├── server.js          # Servidor principal
├── package.json       # Dependências e scripts
├── README.md         # Documentação
└── public/           # Arquivos frontend
    ├── index.html    # Página principal
    ├── styles.css    # CSS
    └── script.js     # JavaScript
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- MySQL (versão 5.7 ou superior) ou MariaDB (10.2+)

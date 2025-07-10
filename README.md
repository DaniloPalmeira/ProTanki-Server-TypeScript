# 🚀 ProTanki Server TypeScript

## 🌟 Visão Geral

O ProTanki Server TypeScript é uma aplicação de servidor robusta, escrita em TypeScript, para alimentar as funcionalidades multiplayer do jogo ProTanki. Projetado com escalabilidade, modularidade e segurança de tipos em mente, este projeto fornece uma infraestrutura flexível e de fácil manutenção para lidar com o ciclo de jogo completo, incluindo autenticação, garagem, lobby e batalhas em tempo real.

> **Fase Atual: Ciclo de Jogo Completo**
> Atualmente, o servidor suporta um fluxo de jogo completo: autenticação de usuários, gerenciamento de garagem com compra e equipamento de itens, um lobby com lista de batalhas em tempo real, e a entrada em partidas com sincronização de estado e física básica.

## ✨ Funcionalidades

-   **Desenvolvido em TypeScript**: Aproveita o TypeScript para segurança de tipos, melhor experiência de desenvolvimento e recursos modernos de JavaScript.
-   **Arquitetura Escalável**: Lida com múltiplas conexões de clientes simultâneas de forma eficiente usando Node.js.
-   **Design Modular**: Código organizado com serviços, modelos e manipuladores de pacotes para fácil extensão e manutenção.
-   **Banco de Dados NoSQL**: Utiliza MongoDB com Mongoose para um gerenciamento de dados robusto e escalável.
-   **Configuração Dinâmica**: Suporta um sistema de configuração genérico chave-valor armazenado no banco de dados, carregado na inicialização do servidor.
-   **Garagem e Inventário**: Sistema completo de garagem que permite aos jogadores comprar, aprimorar e equipar torretas, carrocerias e pinturas.
-   **Lobby e Batalhas**: Gerenciamento de lobby com lista de batalhas, criação de partidas (DM, TDM, CTF) e entrada de jogadores.
-   **Sistema Social**: Funcionalidades de amigos, incluindo adicionar, remover, aceitar/recusar pedidos e notificações de status online.
-   **Missões Diárias**: Sistema que gera missões diárias para os jogadores com recompensas.
-   **Autenticação Segura**: Implementa registro de usuário, login, recuperação de senha com hash bcrypt e verificação por CAPTCHA.
-   **Gerenciamento de Recursos Automatizado**: Um sistema de build inteligente descobre, versiona e processa automaticamente todos os recursos do jogo a partir de uma estrutura de pastas amigável (`resources/`).
-   **Ferramentas de Desenvolvimento**: Inclui ferramentas via linha de comando e uma interface web para facilitar a depuração e o desenvolvimento de pacotes.
-   **Logs Abrangentes**: Sistema de logs completo com Winston para depuração e monitoramento.

## 📋 Pré-requisitos

Antes de configurar o ProTanki Server, certifique-se de ter o seguinte instalado:

-   **Node.js** (v16 ou superior)
-   **npm** (v8 ou superior)
-   **MongoDB** (v4.4 ou superior recomendado)
-   **Git** (para clonar o repositório)

## 🛠️ Instalação

Siga estes passos para configurar o ProTanki Server localmente:

1.  **Clone o repositório**:
    ```sh
    git clone https://github.com/danilopalmeira/ProTanki-Server-TypeScript.git
    cd ProTanki-Server-TypeScript
    ```

2.  **Instale as dependências**:
    ```sh
    npm install
    ```

3.  **Configure as variáveis de ambiente**:
    Crie um arquivo `.env` no diretório raiz com base no `.env.example`. Exemplo de configuração:
    ```env
    # Configurações do Servidor
    PORT=1337
    RESOURCE_PORT=9999

    # Configurações do Banco de Dados (MongoDB)
    MONGODB_URI=mongodb://localhost:27017/protanki_db

    # Configurações de Log
    ENABLE_CONSOLE_LOGGING=true
    LOG_LEVEL=info
    ```
    Ajuste a variável `MONGODB_URI` para o seu ambiente.

4.  **Configure o banco de dados**:
    Certifique-se de que o seu serviço MongoDB esteja em execução. Nenhuma outra configuração é necessária; o banco de dados e as coleções serão criados automaticamente na primeira conexão.

5.  **Adicione os Recursos**:
    Popule a pasta `resources/` com os assets do seu jogo, seguindo a estrutura de pastas categorizada (ex: `resources/ui/login_background/v1/image.jpg`).

6.  **Compile e Execute em Desenvolvimento**:
    Use o comando `dev` para compilar os recursos e iniciar o servidor com recarregamento automático.
    ```sh
    npm run dev
    ```

7.  **Para Produção**:
    Compile os recursos e o código TypeScript:
    ```sh
    npm run build
    ```
    Inicie o servidor:
    ```sh
    npm start
    ```

## 🚀 Uso

-   **Clientes do Jogo**: Configure os clientes do jogo ProTanki para se conectarem ao endereço IP e porta do servidor (ex: `localhost:1337`).
-   **Servidor de Recursos**: Os recursos estáticos do jogo são servidos a partir do diretório `.resource` (que é gerado automaticamente) na `RESOURCE_PORT` configurada (padrão: `9999`).
-   **Logs**: Acompanhe a atividade do servidor em tempo real diretamente no console.

## 🤝 Contribuindo

Agradecemos contribuições para tornar o ProTanki Server ainda melhor! Para contribuir:

1.  Faça um fork do repositório.
2.  Crie uma branch para sua feature (`git checkout -b feature/sua-feature`).
3.  Faça o commit de suas alterações (`git commit -m "Adiciona sua feature"`).
4.  Envie para a branch (`git push origin feature/sua-feature`).
5.  Abra um pull request com uma descrição clara de suas alterações.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📬 Contato

Para perguntas, sugestões ou problemas, por favor, abra uma issue no GitHub ou contate o mantenedor:

-   **Danilo Palmeira**: [GitHub](https://github.com/danilopalmeira)
# 🚀 ProTanki Server TypeScript

## 🌟 Visão Geral
O ProTanki Server TypeScript é uma aplicação de servidor robusta, escrita em TypeScript, para alimentar as funcionalidades multiplayer do jogo ProTanki. Projetado com escalabilidade, modularidade e segurança de tipos em mente, este projeto fornece uma infraestrutura flexível e de fácil manutenção para lidar com conexões de clientes do jogo, autenticação e comunicação.

> **Fase Atual: Página de Login** > Atualmente, o servidor suporta autenticação de usuários, validação de códigos de convite, verificação de disponibilidade de apelidos e carregamento de recursos para a interface de login, com foco em uma experiência de usuário segura e fluida.

## ✨ Funcionalidades
- **Desenvolvido em TypeScript**: Aproveita o TypeScript para segurança de tipos, melhor experiência de desenvolvimento e recursos modernos de JavaScript.
- **Arquitetura Escalável**: Lida com múltiplas conexões de clientes simultâneas de forma eficiente usando Node.js.
- **Design Modular**: Código organizado com serviços, modelos e manipuladores de pacotes para fácil extensão e manutenção.
- **Banco de Dados NoSQL**: Utiliza MongoDB com Mongoose para um gerenciamento de dados robusto e escalável.
- **Configuração Dinâmica**: Suporta um sistema de configuração genérico chave-valor armazenado no banco de dados, carregado na inicialização do servidor.
- **Autenticação Segura**: Implementa registro de usuário, login e recuperação de senha com hash bcrypt e verificação por CAPTCHA.
- **Gerenciamento de Recursos**: Carrega dinamicamente os recursos do jogo (ex: imagens) com base na configuração, com IDs de recursos seguros por tipo.
- **Logs Abrangentes**: Sistema de logs completo com Winston para depuração e monitoramento, com rotação diária de arquivos.

## 📋 Pré-requisitos
Antes de configurar o ProTanki Server, certifique-se de ter o seguinte instalado:
- **Node.js** (v16 ou superior)
- **npm** (v8 ou superior)
- **MongoDB** (v4.4 ou superior recomendado)
- **Git** (para clonar o repositório)

## 🛠️ Instalação
Siga estes passos para configurar o ProTanki Server localmente:

1.  **Clone o repositório**:
    ```sh
    git clone https://github.com/DaniloPalmeira/ProTanki-Server-TypeScript.git
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

5.  **Gere os tipos de recursos**:
    Execute o script para gerar os tipos TypeScript a partir de `resources.json`:
    ```sh
    npm run update
    ```

6.  **Compile o projeto**:
    Compile o código TypeScript para JavaScript:
    ```sh
    npm run build
    ```

7.  **Execute o servidor**:
    Inicie o servidor:
    ```sh
    npm start
    ```
    O servidor estará escutando na porta configurada (padrão: `1337`) para as conexões dos clientes do jogo.

## 🚀 Uso
- **Clientes do Jogo**: Configure os clientes do jogo ProTanki para se conectarem ao endereço IP e porta do servidor (ex: `localhost:1337`). O servidor cuidará do login, registro e verificação de CAPTCHA.
- **Servidor de Recursos**: Os recursos estáticos do jogo (ex: imagens) são servidos a partir do diretório `.resource` na `RESOURCE_PORT` configurada (padrão: `9999`).
- **Logs**: Verifique o diretório `logs` para logs detalhados da atividade do servidor, com rotação diária.

## ⚙️ Configuração
O servidor utiliza um sistema de configuração dinâmico armazenado no banco de dados:
- **Configuração Inicial**: Definida em `initial-config.json`. Exemplo:
  ```json
  {
    "needInviteCode": "false",
    "maxClients": "10"
  }
    ```

  - **Persistência**: As configurações são carregadas na inicialização. Para adicionar uma nova configuração, basta adicioná-la ao `initial-config.json` e reiniciar o servidor.

## 🧪 Executando Testes

*Nota*: Testes ainda não foram implementados na fase atual. Para contribuir com testes:

1.  Adicione arquivos de teste no diretório `tests` usando um framework como o Jest.
2.  Atualize o `package.json` com scripts de teste (ex: `npm test`).
3.  Garanta que os testes cubram serviços, manipuladores de pacotes e operações de banco de dados.

## 📈 Roadmap

  - [x] Implementar a funcionalidade da página de login (autenticação, códigos de convite, CAPTCHA).
  - [x] Configurar um sistema de configuração dinâmico com persistência em banco de dados.
  - [x] Implementar verificação de disponibilidade de apelido com sugestões.
  - [ ] Implementar lobbies de garagem e batalha.
  - [ ] Adicionar lógica de jogo para batalhas e interações de jogadores.
  - [ ] Introduzir clustering para escalabilidade horizontal.
  - [ ] Implementar uma suíte de testes abrangente.

## 🤝 Contribuindo

Agradecemos contribuições para tornar o ProTanki Server ainda melhor\! Para contribuir:

1.  Faça um fork do repositório.
2.  Crie uma branch para sua feature (`git checkout -b feature/sua-feature`).
3.  Faça o commit de suas alterações (`git commit -m "Adiciona sua feature"`).
4.  Envie para a branch (`git push origin feature/sua-feature`).
5.  Abra um pull request com uma descrição clara de suas alterações.

Por favor, siga estas diretrizes:

  - Adira ao estilo de código existente.
  - Escreva mensagens de commit claras.
  - Inclua testes para novas funcionalidades quando possível.
  - Atualize a documentação (ex: README) para mudanças significativas.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📬 Contato

Para perguntas, sugestões ou problemas, por favor, abra uma issue no GitHub ou contate o mantenedor:

  - **Danilo Palmeira**: [GitHub](https://github.com/DaniloPalmeira)

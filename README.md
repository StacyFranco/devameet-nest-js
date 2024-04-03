# Devameet Back API
Projeto desenvolvido para apresentação do node.js e Nest na formação Devaria 2023. Este projeto é uma aplicação para criar reuniões de video e audio de uma forma interativa, onde é criada uma sala de reuniões e cada participante é um personagem que pode se movimentar pela mesma. O Devameet apresenta as funcionalidades:
- criar conta
- escolher avatar
- criar/deletar reunião
- editar a sala de reunião (colocar e tirar objetos)
- iniciar a reunião
- mutar e retirar video da reunião


Para testes da API pode usar esta [Collection do Postman](https://github.com/StacyFranco/devameet-nest-js/blob/master/Devameet-NestJS.postman_collection.json)!

### Tecnologias Utilizadas

- Nest.js 10.0.0
- Node.js 18.16.0
- socket.io 4.7.2
- class-transformer 0.5.1
- class-validator 0.14.0
- crypto-js 4.1.1
- passport 0.6.0
- passport-jwt 4.0.1
- mongoose 7.6.3

   

### Configuração do ambiente de desesnvolvimento
1. Clonar o repositório :git clone <url_git>.
1. Fazer cópia .env.examplo e renomear o novo arquirvo de .env
1. Configurar as variaveis de ambiente no arquivo .env
1. Instale as dependências do projeto npm i.
1. Execute o comando npm run start:dev para subir a aplicação.

#### O projeto de Front End pode ser encontrado em: https://github.com/StacyFranco/devameet-react-vite-js
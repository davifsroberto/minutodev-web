# Implementation Plan - minutoDev

## Objetivo

Construir uma primeira versão funcional do minutoDev para uso pessoal.

O foco não é monetização ou crescimento.

O objetivo é resolver o problema de acompanhar tecnologia de forma simples e centralizada.

---

# Sprint 1 - Coleta de Conteúdo

## Objetivo

Coletar conteúdos automaticamente de fontes públicas.

## Entregáveis

* Estrutura inicial do backend
* Cadastro de fontes
* Leitura de RSS
* Integração com GitHub
* Armazenamento dos conteúdos

## Fontes iniciais

* Angular Blog
* GitHub Trending
* Hacker News
* Dev.to
* OpenAI
* Anthropic

## Critério de sucesso

Conseguir importar conteúdos automaticamente e armazená-los localmente.

---

# Sprint 2 - Normalização e Banco

## Objetivo

Transformar conteúdos de diferentes fontes em um formato único.

## Entregáveis

Modelo único de conteúdo:

* Título
* Resumo
* Fonte
* URL
* Data
* Categoria

Persistência em banco de dados.

Remoção de duplicidades básicas.

## Critério de sucesso

Todos os conteúdos aparecem utilizando o mesmo modelo.

---

# Sprint 3 - Radar de Hoje

## Objetivo

Criar a primeira versão visual do radar.

## Entregáveis

Tela:

* Tendências
* Ferramentas
* Releases
* Conteúdos recomendados

Cards simples.

Links para a fonte original.

## Critério de sucesso

Ser possível consultar os conteúdos do dia em uma única página.

---

# Sprint 4 - Relevância

## Objetivo

Reduzir ruído e destacar conteúdos importantes.

## Entregáveis

Sistema simples de score.

Critérios possíveis:

* Recência
* Popularidade
* Quantidade de fontes falando sobre o assunto

Agrupamento de conteúdos semelhantes.

## Critério de sucesso

O radar deixa de ser uma lista cronológica e passa a destacar o que é mais relevante.

---

# Sprint 5 - Resumos

## Objetivo

Diminuir o tempo necessário para entender cada conteúdo.

## Entregáveis

Resumo curto para cada item.

Estrutura:

* O que aconteceu
* Por que importa

Exemplo:

Título:
Angular 22.1 lançado

Resumo:
Nova versão com melhorias de performance e build.

Por que importa:
Projetos grandes podem ter tempos de compilação menores.

## Critério de sucesso

Entender rapidamente se vale a pena abrir o conteúdo original.

---

# Sprint 6 - Radar Semanal

## Objetivo

Criar uma visão consolidada da semana.

## Entregáveis

Página:

* Top tendências
* Top ferramentas
* Top artigos
* Top releases

Resumo semanal.

## Critério de sucesso

Permitir atualização mesmo para quem não consulta diariamente.

---

# Sprint 7 - Temas Personalizados

## Objetivo

Permitir acompanhar apenas assuntos de interesse.

## Entregáveis

Seleção de temas.

Exemplos:

* Angular
* IA
* Testes
* Cloud
* DevOps
* Arquitetura

Filtro do radar.

## Critério de sucesso

Cada usuário visualiza apenas os temas desejados.

---

# Não Priorizar Agora

* Mobile
* Gamificação
* Rede social
* Chat
* Marketplace
* Cursos
* Comunidade
* Sistema de pontos

Essas ideias só devem ser revisitadas após o produto principal estar funcionando e sendo utilizado regularmente.

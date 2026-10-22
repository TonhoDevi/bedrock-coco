# Coco (add-on para Minecraft Bedrock)

Add-on pequeno e bobo: as vacas fazem coco de vez em quando. Dá para juntar, empilhar e arremessar o coco nos outros. Quem leva um coco fica **fedendo** por 60 segundos, e os aldeões fogem de jogador fedido.

- Versão do jogo: Bedrock **1.26.20 ou mais novo** (feito em outubro de 2026, com o jogo na 1.26.50).
- **Não precisa ativar nenhum Experimento.** O script usa só o módulo estável `@minecraft/server` 2.0.0.
- Funciona em mundo local, LAN, servidor (BDS) e Realm. Tudo roda no servidor, cada jogador tem seu próprio estado.

## Novidades da versão 1.1

- Coco em 3D na mão (primeira e terceira pessoa). O ícone do inventário continua 2D.
- Arremesso mais lento, em parábola parecida com a da bola de neve (uns 10 a 12 blocos).
- Dano de verdade: meio coração, com piscar vermelho, som de dano e empurrãozinho. Antes era 0,1 e o jogo arredondava para zero.
- Respingo marrom no impacto (em criatura ou bloco).

## O que tem

| Coisa | Como funciona |
|---|---|
| Vaca fazendo coco | Vacas e mooshrooms **adultas** tentam a cada 10 s, com chance de 1/30 (em média 1 coco a cada 5 min por vaca). Depois de fazer, a vaca descansa 3 min. Só aparece se o bloco onde a vaca está for ar e o de baixo for chão firme. Se já existirem 6 blocos de coco num raio de 8 blocos, a vaca não faz mais ali. |
| Bloco Coco | Montinho 3D em camadas, sem colisão (dá para andar por cima). Empilha igual ovo de tartaruga: clique com um Coco na mão em cima do bloco para ir de 1 até 4. Quebrou, cai a quantidade certa de itens. Se o bloco de baixo sumir, o coco quebra. |
| Item Coco | **Clicar num bloco** (na face de cima) coloca o coco no chão. **Usar no ar** (botão direito no PC, segurar o dedo no celular, gatilho esquerdo no console) arremessa o coco numa parábola um pouco mais lenta que a bola de neve (alcance de uns 10 a 12 blocos). Gasta 1 item fora do criativo. Na mão aparece um montinho 3D; no inventário o ícone continua 2D. |
| Acerto | Respingo: pedacinhos marrons voam e caem, com o som `coco.splash`. Em criatura: deixa **fedendo**, dá meio coração de dano (piscar vermelho e som de dano do próprio jogo) e um empurrãozinho. O fedor pega mesmo se o dano não pegar (criativo, mob invulnerável). |
| Fedendo | Dura 60 s e reinicia se levar outro coco. Sai fumacinha verde e marrom da criatura. O jogador vê "Você está fedendo!" na barra de ação e ouve um som. Entrar na **água** tira o fedor na hora ("O cheiro passou."). Chuva não limpa. Morrer, sair e voltar ao mundo também limpam. |
| Sons | `coco.diarreia` (vaca soltando o coco, ouvido de longe) e `coco.splash` (coco acertando algo). Sao arquivos `.wav` sintetizados em `coco_RP/sounds/coco/`; para trocar por outro som, substitua os arquivos mantendo os nomes. |
| Composteira | Clicar com o Coco numa composteira gasta 1 coco e sobe 1 nível com 50% de chance (constante `CHANCE_COMPOSTEIRA`). No nível 7 vira 8 (pronta) após 1 s. Feita por script, como o Bedrock não deixa itens novos entrarem na lista de compostagem. |
| Aldeões | Aldeões fogem de qualquer **jogador** fedendo e ficam a uns 10 blocos de distância enquanto durar. Aldeões zumbis não são afetados. Aldeão que leva coco só solta fumacinha. |

O item fica no inventário criativo na aba **Natureza**. Não há receita: o coco só vem das vacas.

## Como instalar

**PC (Windows), celular e tablet:** abra o arquivo `Coco.mcaddon` (dois cliques no PC, ou "Abrir com Minecraft" no celular). O jogo importa os dois pacotes sozinho.

Depois, para cada mundo:
1. Editar o mundo (ou criar um novo).
2. Em **Pacotes de comportamento**, ative **Coco**. O jogo pergunta se quer ativar também o pacote de recursos: aceite. Se não perguntar, ative **Coco** em **Pacotes de recursos** também.
3. Não precisa mexer em **Experimentos**.

**Console (Xbox, PlayStation, Switch):** console não abre arquivo `.mcaddon` direto. O jeito mais fácil é instalar no PC ou celular, ativar num mundo e jogar esse mundo pelo Realm, ou entrar no mundo de quem tem o add-on (os pacotes são baixados automaticamente ao entrar).

**Multiplayer local (LAN) ou entrar no mundo de alguém:** só quem hospeda precisa ter o add-on instalado. Quem entra baixa os pacotes ao conectar (aceite o download de recursos).

**Realm:** ative os pacotes num mundo local e depois use **Editar Realm > Substituir mundo** com esse mundo. Os pacotes vão junto. (Também dá para ativar pacotes direto nas configurações do Realm, se o seu dispositivo permitir.)

**Servidor dedicado (BDS):**
1. Copie `coco_BP` para `behavior_packs/` e `coco_RP` para `resource_packs/` do servidor.
2. No mundo (`worlds/<nome>/`), crie ou edite:
   - `world_behavior_packs.json`: `[{"pack_id": "1bb32139-ecbf-4a18-bb51-f33f35dcc4ea", "version": [1, 10, 1]}]`
   - `world_resource_packs.json`: `[{"pack_id": "089b6443-a895-404c-b2ca-849f585a083e", "version": [1, 10, 1]}]`
3. Opcional: `texturepack-required=true` no `server.properties` para todo mundo baixar o pacote de recursos.

## Como ajustar os valores

Abra `coco_BP/scripts/main.js` num editor de texto. As constantes ficam no topo (20 ticks = 1 segundo):

| Constante | Padrão | O que faz |
|---|---|---|
| `VERIFICAR_VACAS_TICKS` | 200 (10 s) | De quanto em quanto tempo as vacas tentam fazer coco |
| `CHANCE_COCO` | 1/30 | Chance em cada tentativa. 1/60 deixa duas vezes mais raro |
| `COOLDOWN_VACA_TICKS` | 3 min | Descanso da vaca depois de fazer coco |
| `RAIO_LIMITE` / `MAX_COCOS_NA_AREA` | 8 / 6 | Limite de blocos de coco numa área |
| `DURACAO_FEDOR_TICKS` | 60 s | Duração do fedor |
| `DANO_COCO` | 1 | Dano do arremesso. 1 = meio coração, 2 = um coração. Use número inteiro: abaixo de 1 o jogo arredonda para 0 e não há dano nem piscar vermelho |
| `EMPURRAO_COCO` | 0,25 | Empurrão (knockback) no alvo. 0 desliga |
| `VELOCIDADE_ARREMESSO` | 0,7 | Velocidade do arremesso em blocos por tick (bola de neve: 1,5) |
| `TICKS_APOS_IMPACTO` | 2 | Quanto tempo o coco fica parado no ponto do impacto antes de sumir (evita ele sumir antes de bater) |
| `VELOCIDADE_MAXIMA` | 0,75 | Limite de velocidade do coco em voo (blocos por tick); impede a queda de acelerar demais |
| `ALTURA_ARREMESSO` | 3/16 | Quanto mais alto o coco nasce ao ser arremessado |

A queda do coco no ar fica em `coco_BP/entities/coco_arremessado.json`, campo `gravity` (0,035; bola de neve: 0,03). Mais gravidade = cai mais rápido e vai menos longe. O campo `power` do mesmo arquivo não vale para o arremesso do script (o script passa a velocidade direto), mas foi deixado igual a `VELOCIDADE_ARREMESSO` por coerência.

### Coco na mão (posição, giro e tamanho)

O montinho 3D na mão é o attachable `coco_RP/attachables/coco.attachable.json`, com o modelo em `coco_RP/models/entity/coco_na_mao.geo.json`. **Os valores de posição, giro e tamanho ficam todos em `coco_RP/animations/coco_na_mao.animation.json`**, e foram chutados a partir do exemplo da Bedrock Wiki (ninguém viu no jogo ainda):

- `animation.coco.na_mao.primeira_pessoa`: como você vê o coco na sua própria mão.
- `animation.coco.na_mao.terceira_pessoa`: como os outros (e a câmera F5) veem.

Em cada uma:
- `position` [x, y, z] em pixels (16 = 1 bloco). x = lados, y = cima/baixo, z = frente/trás. Mude de 1 em 1.
- `rotation` [x, y, z] em graus. Mude de 10 em 10 até acertar.
- `scale`: tamanho (1 = tamanho do modelo; 0,5 = metade).

Para ver a mudança sem reinstalar tudo, edite direto a cópia em `development_resource_packs/coco_RP` e saia e entre de novo no mundo. Se o coco ficar de cabeça para baixo na primeira pessoa, troque o último número da `rotation` (-159) por algo perto de 20.

Depois de mudar, gere o `.mcaddon` de novo (veja abaixo) ou edite direto a cópia instalada do pacote. Se mudar um pacote já instalado com o mesmo número de versão, o jogo pode manter a versão antiga em cache: aumente `version` no `manifest.json` dos dois pacotes (e nas dependências) ou remova e importe de novo.

Para refazer o `.mcaddon` (Linux): dentro desta pasta, `rm Coco.mcaddon; zip -r Coco.mcaddon coco_BP coco_RP`.

## Testar rápido

Ative **Cheats** no mundo e use:

- `/give @s coco:coco 16`: pega cocos.
- `/summon cow`: chama uma vaca. Para não esperar minutos, diminua `CHANCE_COCO` para `1` e `COOLDOWN_VACA_TICKS` para `0` enquanto testa.
- `/setblock ~ ~ ~1 coco:coco ["coco:quantidade"=3]`: coloca uma pilha de 3.
- `/summon villager_v2`: chama um aldeão para ver ele fugir quando você estiver fedendo.
- `/tag @s remove coco_fedendo`: tira o fedor na mão (ou pule na água).
- Para ficar fedendo você mesmo, peça para outra pessoa jogar um coco em você (o próprio arremessador normalmente não é atingido) ou use `/tag @s add coco_fedendo` (sem contador, some no próximo meio segundo; serve só para ver a mensagem de "O cheiro passou").

## Limitações conhecidas

- **Bedrock não tem efeito de status customizado.** O "Fedendo" é uma tag (`coco_fedendo`) mais um contador salvo na criatura. Por isso não aparece ícone no HUD nem no inventário; o aviso é só a mensagem na barra de ação.
- **O aldeão foi sobrescrito.** Para os aldeões fugirem, o pacote traz uma cópia do `villager_v2.json` oficial da versão 1.26.50 com uma regra a mais. Consequências:
  - Outro add-on que também mexa no aldeão vai conflitar (vale o que estiver mais acima na lista de pacotes).
  - Se uma atualização futura do Minecraft mudar o aldeão, o pacote continua usando o aldeão da 1.26.50 até a cópia ser atualizada (pegar o arquivo novo em `github.com/Mojang/bedrock-samples`, `behavior_pack/entities/villager_v2.json`, e reaplicar o trecho do `coco_fedendo` dentro de `minecraft:behavior.avoid_mob_type`).
  - Só o aldeão atual (`villager_v2`) foge. O aldeão antigo (`villager`) é convertido para o novo pelo próprio jogo.
  - A fuga usa o mesmo comportamento de quando o aldeão foge de zumbi, então durante algumas tarefas mais importantes (dormir, por exemplo) ele pode não fugir.
- O dano mínimo que o jogo aplica é 1 (meio coração); a primeira versão usava 0,1 e o jogo arredondava para 0.
- Mobs só fedem enquanto estão carregados (perto de algum jogador). O tempo de fedor só corre nessas horas.
- Colocar coco só funciona na face de cima de um bloco (como o ovo de tartaruga só fica no chão).

## Decisões técnicas (para quem for mexer)

- **Colocar x arremessar:** o item tem `minecraft:block_placer` (com `replace_block_item`, então o item é o próprio item do bloco, igual o vanilla faz com algumas plantas). O clique em bloco coloca o coco pelo jogo mesmo. O arremesso é feito por script no evento `itemUse`, criando a entidade `coco:coco_arremessado` (com `minecraft:projectile`) e chamando `shoot()`. Não usei `minecraft:throwable` no item porque ele também arremessaria ao clicar num bloco, brigando com a colocação. Como proteção, o script ignora o `itemUse` se o jogador clicou num bloco no mesmo tick.
- **Empilhar:** `world.beforeEvents.playerInteractWithBlock` cancela o clique com Coco em cima de um bloco de Coco (para não colocar outro por cima) e aumenta o estado `coco:quantidade`.
- **Dano:** `applyDamage` com causa `projectile` e o arremessador como autor passa pelo sistema normal de dano (piscar vermelho, som de dano, crédito pela morte). O empurrão vem de `applyKnockback`, na direção em que o coco voava. O fedor é aplicado antes do dano, separado dele.
- **Fedor:** tag `coco_fedendo` (que o aldeão enxerga pelo filtro `has_tag`) mais a dynamic property `coco:fedor_restante` com os ticks restantes, descontada a cada 0,5 s. Isso sobrevive a salvar e fechar o mundo.
- **Fuga dos aldeões:** feita no comportamento da entidade (e não empurrando por script) porque é o jeito normal do jogo: o aldeão anda e corre de verdade, desvia de obstáculos e não leva "empurrões" estranhos. O custo é o conflito/atualização descrito acima.

## O que NÃO foi testado no jogo

Nada foi testado dentro do Minecraft (não há Bedrock nesta máquina). Foi verificado: todos os JSON abrem sem erro, todos os caminhos e geometrias referenciados existem, UUIDs únicos e dependências BP/RP cruzadas, nomes de sons conferidos no pacote vanilla, e o `main.js` passou em `node --check` e na checagem de tipos do TypeScript contra as definições oficiais do `@minecraft/server` 2.0.0 e 2.10.0.

Pontos com mais chance de precisar de ajuste depois do primeiro teste:

1. Se o `itemUse` dispara para itens com `block_placer` ao usar no ar (o arremesso depende disso). Se o coco não for arremessado, essa é a causa.
2. Se o cancelamento do clique no bloco de coco também evita o arremesso e a colocação por cima (deveria).
3. Aparência do montinho (geometria, cores, textura), da fumacinha, do coco voando e do respingo.
4. **Posição, giro e tamanho do coco na mão** (primeira e terceira pessoa): os números são uma estimativa, veja "Coco na mão" acima.
5. Se o alcance ficou mesmo em 10 a 12 blocos (a conta foi feita numa simulação simples da física do projétil).
6. Se o empurrão (`applyKnockback`) funciona bem em jogadores e não fica forte demais.
7. Se a regra de fuga dos aldeões tem prioridade suficiente.
8. Se o clique com Coco na composteira sobe o nível, toca o som e vira "pronta" no nível 8.
9. Se o bloco quebra direitinho quando o chão embaixo é removido (`minecraft:placement_filter`).

Se algo der errado, ative **Configurações > Criador > Log de conteúdo** (Content Log) no jogo: os erros do pacote aparecem lá.


## Coco arremessado em 3D

O coco em voo agora usa `coco_RP/models/entity/coco_projetil.geo.json` (o mesmo montinho) girando no ar (`coco_RP/animations/coco_projetil.animation.json`). No impacto, o script prende o coco no ponto da batida e o remove 2 ticks depois, em vez de o jogo removê-lo na hora.

## Sons (créditos e como testar)

- `splash_1..8.ogg`: do pacote "25 CC0 mud SFX" (OpenGameArt, CC0, domínio público). O `coco.splash` sorteia entre eles.
- `peido_1.wav` e `peido_2.wav`: "Synthetic Farts" de **dklon** (OpenGameArt, licença CC-BY 3.0). Crédito obrigatório: dklon, https://opengameart.org/content/synthetic-farts
- `diarreia_sintetica.wav`: gerado por mim com código. O `coco.diarreia` sorteia entre os três.
- Para ouvir cada um no jogo: `/playsound coco.teste_splash_1 @s` (até `_8`), `coco.teste_peido_1`, `coco.teste_peido_2`, `coco.teste_sintetico`. Para tirar um som do sorteio, apague a linha dele em `coco_RP/sounds/sound_definitions.json`.

## Água e frequência (versão 1.2)

- Água encostando no coco (em cima ou nos lados) quebra o bloco e solta os itens, como cultivos no Java. O script checa os cocos num raio de 24 blocos de cada jogador a cada 0,5 s (`RAIO_AGUA`, `INTERVALO_AGUA_TICKS`). Cocos longe de qualquer jogador só quebram quando alguém chega perto.
- Vacas: tentam a cada 5 s com chance de 1/6 e descansam 1 min depois de cada coco (em média um coco a cada ~1,5 min por vaca). O limite de 6 cocos no raio de 8 blocos continua valendo (`MAX_COCOS_NA_AREA`).

## Ajustes da versão 1.3

- Vaca: ~3 min por coco (descansa 2,5 min + ~30 s de espera). Limite de 8 cocos num raio de 8 blocos.
- **Chuva lava o coco**: coco ao ar livre (nada em cima) durante chuva ou tempestade no mundo normal some depois de ~10 s e solta os itens (`CHANCE_CHUVA`). Limitação: o script só sabe que está chovendo depois de uma *mudança* de tempo; se você abrir o mundo no meio de uma chuva, só vale a partir da próxima mudança (use `/weather clear` e `/weather rain` para forçar). Biomas secos e de neve não são tratados à parte.
- Som da diarreia mais alto: `VOLUME_DIARREIA` 6 (antes 3) e `max_distance` 96 em `sound_definitions.json`.

## Versão 1.4: quantidades, coco grandão e passos

- A vaca solta 1 a 5 cocos de uma vez, sorteado (`SORTEIO_QUANTIDADE` no topo do `main.js`: pares quantidade/peso; hoje 35% / 30% / 20% / 12% / 3%).
- **Nível 5 = coco grandão**: um montão único e alto (15 px, dentro de 1 bloco) que dropa 5 cocos. Clicando com um coco numa pilha de 4, ela vira o grandão. `MAX_PILHA` = 5; geometria `geometry.coco_5`.
- **Passos (colisão):** o coco agora tem colisão baixa (3 px, 7 px no grandão; o jogador sobe sozinho, como num degrau pequeno). Assim o som de passo é do próprio bloco: `coco_RP/sounds.json` (bloco `coco`, ligado em `blocks.json`) usa `coco.passo` (4 sons de lama) para passo, pulo e queda, o splash ao quebrar e o slime ao colocar. O script de passos antigo foi removido. Se o coco ficar em silêncio ao andar, o `sounds.json` customizado não foi aceito: volte `blocks.json` para `"sound": "slime"`.

**Correção dos sons de bloco:** passo, pulo, pouso e queda ficam em `interactive_sounds.block_sounds` do `sounds.json` (no formato do jogo, não em `block_sounds`, onde só vão colocar, quebrar e bater).

**Sons do bloco = lama vanilla:** passo, pulo, quebrar, colocar e bater usam o grupo `mud` do próprio Minecraft (`coco_RP/blocks.json`, sem `sounds.json` próprio). Só a vaca soltando (`coco.diarreia`) e o coco acertando algo (`coco.splash`) usam sons do add-on.

**Splash padronizado:** `coco.splash` toca só `splash_1.ogg`. Para trocar por outro, edite o nome em `sound_definitions.json` (ouça antes com `/playsound coco.teste_splash_N @s`, N de 1 a 8).

**Versão final:** `coco.diarreia` sorteia só entre `peido_1` e `peido_2` (o som sintético foi retirado do sorteio; o arquivo `diarreia_sintetica.wav` ficou sem uso).

## Versão 1.5: vaca amarela

- **Vaca amarela** (`coco:vaca_amarela`): igual à vaca normal, mas com as manchas amarelas. Copiada da vaca oficial (comportamento, leite, drops, sons). Surge rara: cada vaca adulta que surge (natural, ovo, `/summon`) tem 1/20 de virar amarela (`CHANCE_VACA_AMARELA`). Cruza só com outra amarela e o filhote também é amarelo. Para testar: `/summon coco:vaca_amarela` ou o ovo gerador (aba Itens de spawn).
- Ela faz o ritmo normal de coco, mas solta **bosta amarela** (`coco:coco_amarelo`): mesmo bloco empilhável de 1 a 5 (sem item para colocar de volta), mesma água/chuva que lava.
- **Bosta amarela (item)**: não pode ser arremessada nem colocada; só **comer** (segurar o botão direito). Recupera 1 de fome (meia coxa), pode ser comida mesmo sem fome e dá **Náusea** por 15 s (`DURACAO_NAUSEA_TICKS`).
- Texturas geradas a partir da vaca oficial: `coco_RP/textures/entity/vaca_amarela*.png`.
- Não testado no jogo: aparência da vaca (render controller próprio com geometria vanilla `geometry.cow.v2`/`geometry.cow.baby`), sons da vaca (`coco_RP/sounds.json`) e se o `itemCompleteUse` aplica a náusea.

## Versão 1.6: bosta seca

- **Bosta seca** (`coco:bosta_seca`): feita ao colocar **coco normal na fornalha** (receita `coco_BP/recipes/bosta_seca_fornalha.json`). Mesmo comportamento do coco: bloco empilhável de 1 a 5, arremesso, composteira, deixa fedendo. É um pouco mais clara (textura `bosta_seca.png`, o coco normal com brilho +30%).
- **Dano maior**: 1 coração (`DANO_SECO` = 2; o coco normal faz meio).
- **Mancha**: ao bater num bloco, a bosta seca deixa uma mancha na face atingida, como a trepadeira (bloco `coco:bosta_mancha`, estado `coco:face` 0..5, uma geometria de plano por face em `coco_RP/models/blocks/bosta_mancha.geo.json`, textura recortada `bosta_mancha.png`). Só vai em face cujo vizinho é ar. Sem colisão, não dropa nada, dá para quebrar com a mão.
- A mancha sai com **água** (encostando) e **chuva** (ao ar livre, ~5 s, `CHANCE_CHUVA_MANCHA`), e some se o bloco de apoio for removido. A checagem é a mesma do coco (raio de 24 blocos dos jogadores).
- Não testado no jogo: se a receita aparece/funciona na fornalha, o encaixe visual das manchas nas 6 faces, e se `getBlockHit().face` bate com os lados esperados.

## Versão 1.7

- **Vaca amarela**: agora o corpo é amarelo e as manchas são brancas (antes: corpo marrom, manchas amarelas).
- **Coco que volta**: jogando o coco (qualquer tipo) para cima, ele pode cair na cabeça de quem arremessou: fedor, dano e empurrão no próprio jogador. Só vale depois de `TICKS_VOLTA_NO_JOGADOR` (8 ticks) e com o coco descendo. O jogo ignora o dono do projétil, então a checagem é feita pelo script (distância horizontal < 0,55 bloco do jogador).
- **Mancha da bosta seca**: sempre que acerta uma face de bloco inteiro com o espaço da frente livre (ar), a mancha aparece. Faces que não são quadradas são ignoradas: o ponto de impacto tem de estar na borda da célula (tira tapete, laje de baixo, neve, terra arada...) e o nome do bloco não pode ser de escada, laje, cerca, muro, porta, alçapão, vidraça, grade, mato, flores, tocha, trilho etc. (lista `NAO_QUADRADO` no `main.js`). Se a lista deixar passar algum bloco estranho, é só acrescentar a palavra.
- **Vidro**: bosta seca em vidro, vidro colorido ou vidraça tem 35% de chance de quebrar (`CHANCE_QUEBRAR_VIDRO`); se quebrar, não deixa mancha.

## Versão 1.7.1

- **Mancha nas laterais**: as geometrias norte/sul/leste/oeste estavam do lado oposto (a mancha ficava na borda de fora da célula, "voando"). Agora ficam grudadas no bloco atingido (caixas de seleção também).
- **Coco que volta**: descendo/subindo agora é decidido pela posição do coco no tick anterior (antes usava `getVelocity`, que pode não funcionar em projétil); tolerância horizontal 0,7.

## Versão 1.7.2

- **Mancha frente/trás**: o ajuste da 1.7.1 só valia para leste/oeste. Pelo teste no jogo, no eixo norte-sul o modelo é espelhado em relação ao mundo, então a geometria (e a caixa de seleção) de norte/sul voltou à posição original.
- `TICKS_APOS_IMPACTO` = 1 (o coco parado no impacto parecia quicar na parede).
- **Coco que volta**: a causa provável era `world.getEntity`, que pode não existir no módulo 2.0.0 (dava erro a cada tick, sem aparecer). Agora o script guarda a própria entidade do projétil.

## Versão 1.8: animações do braço

- **Arremesso pelo jogo**: os itens Coco e Bosta seca agora têm `minecraft:throwable` (`do_swing_animation: true`) e `minecraft:projectile`, então quem lança e balança o braço é o próprio jogo, como a bola de neve. O `block_placer` continua agindo primeiro ao clicar num bloco (colocar no chão), então o arremesso só acontece no ar. O script não lança mais nada; só registra o projétil criado (`entitySpawn`) para o coco poder voltar no dono.
- A velocidade vem do campo `power` (0,7) e a queda de `gravity` em `entities/coco_arremessado.json` / `bosta_seca_arremessada.json`. As constantes `VELOCIDADE_ARREMESSO`, `ALTURA_ARREMESSO` e `INTERVALO_ARREMESSO_TICKS` foram removidas. Sem o som do arco que o script tocava.
- **Comer**: bosta amarela com `minecraft:use_animation: "eat"`.
- **Colocar no chão**: usa o `block_placer` do jogo, que balança o braço sozinho. Se ainda não balançar, não há como disparar o balanço por script na API estável.
- Não testado: se o jogo prefere `throwable` ou `block_placer` ao clicar num bloco, e se o cooldown entre arremessos ficou aceitável (antes o script limitava a 1 a cada 5 ticks).

## Versão 1.8.1

- **Mancha nos 4 lados**: como as tentativas de acertar a orientação norte/sul/leste/oeste no escuro não bateram com o jogo, a geometria agora não depende mais disso. Cada lado desenha **dois planos** (um em cada borda da célula) com a face visível virada para dentro da célula. Quem olha de fora da parede só enxerga o plano grudado nela (o outro fica de costas e some). Só aparece o plano de trás se você ficar entre a parede e a mancha, dentro da célula. Cima e baixo continuam com um plano só.
- A mancha não tem mais caixa de seleção (o clique atravessa; some só com água, chuva ou se o apoio sumir).
- **Ricochete infinito**: nova vigia dos cocos em voo, 1x por tick. Se o jogo não avisar o impacto e o coco parar ou voltar para trás, conta como impacto (splash, prende e remove; a bosta seca ainda tenta deixar a mancha achando o bloco com um raio). Nenhum coco voa mais que `TEMPO_MAXIMO_VOO_TICKS` (15 s).

## Versão 1.8.2

- **Colocar e arremessar ao mesmo tempo**: com o `throwable` o jogo fazia as duas coisas ao clicar num bloco. Agora o `beforeEvents.itemUse` cancela o arremesso se houve clique em bloco no mesmo instante ou se há bloco ao alcance (6) na mira. Ou seja: mirando um bloco perto, só coloca; só arremessa mirando o ar/longe.
- **Mancha escura nas paredes** (prints do usuário): o plano grudado na parede saía preto e o outro, 1 bloco à frente, saía marrom. Interpretação: o rótulo de face das laterais agia ao contrário do esperado (a luz era amostrada para dentro da parede). Mudanças: rótulos de norte/sul/leste/oeste trocados nos dois planos; material `alpha_test_single_sided` (só o plano de frente aparece); `ambient_occlusion` e `face_dimming` desligados. Se ainda aparecer errado, trocar de novo os rótulos em `coco_RP/models/blocks/bosta_mancha.geo.json` ou voltar o material para `alpha_test`.

## Versão 1.8.3

- **Deslizando antes de estourar**: o coco era preso no ponto do impacto e removido 1 tick depois (`TICKS_APOS_IMPACTO`, agora apagado). Agora é removido na hora do impacto (`prenderNoImpacto` só faz `remove()`), então não desliza mais na parede. O splash de partículas continua.
- **Mancha flutuando**: na 1.8.2 só o plano de trás aparecia. Voltei os rótulos de face da 1.8.1 (o material `alpha_test_single_sided` e AO/face_dimming desligados ficam), o que deve inverter qual dos dois planos aparece.
- **Hitbox da mancha** (como a trepadeira): caixa de seleção fina na borda da parede. As bordas seguem o que o usuário confirmou na 1.7.1 (leste/oeste) e na 1.7.2 (norte/sul, no eixo z o modelo é espelhado); se alguma ficar do lado errado, trocar em `coco_BP/blocks/bosta_mancha.json`.

## Versão 1.8.4

- Hitbox da mancha nas 4 laterais movida para a borda oposta (estava do lado de fora). Só a caixa de seleção mudou; a geometria/textura ficou igual. Cima e baixo não mudaram.

## Versão 1.8.5

- Mancha com **um plano só** por lado (o que fica na parede, na mesma borda da hitbox). O plano extra foi removido.

## Versão 1.8.6

- **Subida limitada**: o coco jogado para cima ia muito alto. A vigia agora corta a subida quando ele passa de `ALTURA_MAXIMA_SUBIDA` (3,5 blocos acima de onde saiu): zera a velocidade vertical, mantém a horizontal e deixa a gravidade fazer cair. Durante 5 ticks depois do corte a detecção de "parou/voltou" fica desligada (senão contaria como impacto). Se o corte não funcionar bem em projétil (`applyImpulse`), o caminho é aumentar `gravity` em `entities/*_arremessado*.json`.

## Versão 1.8.7

- **Deslizar na parede**: os avisos de impacto do jogo parecem não chegar para o coco lançado pelo `throwable` (ele desliza até a vigia notar que parou). Agora, a cada tick, a vigia lança um raio de 1 passo à frente do coco; se há bloco no caminho, o impacto é resolvido naquele instante (splash, remoção, mancha), antes de deslizar. Só vale a partir do 2º tick de voo.

## Versão 1.8.8

- **Item da bosta amarela sem ícone/nome/comer**: o item e o bloco tinham o mesmo identificador (`coco:coco_amarelo`) e o bloco (sem item) engolia o item. O item agora é `coco:bosta_amarela` (o bloco continua `coco:coco_amarelo`); loot, script e textos atualizados. Use `/give @s coco:bosta_amarela`. Itens antigos de teste com o nome velho somem.
- **Estourar antes da parede**: a vigia olhava um passo inteiro à frente. Agora olha só `MARGEM_IMPACTO` = 0,25 bloco (o coco para ~0,125 antes da superfície, metade da caixa de colisão de 0,25), ou seja, resolve o impacto quando encosta. O raio que acha a face para a mancha também ficou curto (0,75). Se a mancha ainda não sair, o motivo aparece no Content Log como `coco: impactoSemAviso falhou`.

## Versão 1.8.9

- Desenho da mancha nas 4 laterais movido para a borda oposta à da hitbox (estava entrando na parede). A hitbox não mudou.

## Versão 1.8.10

- Desenho da mancha nas laterais agora fica na **face externa da hitbox** (a 1 px da parede, em vez de colado nela, onde parecia entrar na pedra) e com o rótulo virado para fora da parede (norte: z=7 "north"; sul: z=-7 "south"; oeste: x=7 "west"; leste: x=-7 "east").

## Versão 1.8.11

- Comando de teste `/scriptevent coco:teste_mancha`: monta uma torre branca 3x3x3 a 5 blocos a leste de quem digitou. No meio de cada lado há um bloco colorido com a mancha daquele lado na frente: **vermelho = norte, azul = sul, amarelo = oeste, verde = leste**. Serve para dizer qual lado está certo ou flutuando sem precisar saber a bússola.

## Versão 1.8.12

- Mancha leste/oeste: o plano ficava do lado errado da hitbox (eu tinha invertido as bordas da caixa de seleção de leste/oeste ao posicionar o plano na 1.8.10). Agora oeste: x=-7 (rótulo "east"), leste: x=7 (rótulo "west"), junto da hitbox. Norte/sul já estavam certos (conferido pelas prints com bússola do usuário).

## Versão 1.8.13

- Mancha leste/oeste sumia (plano na posição certa, mas com o rótulo virado para o lado que o material de face única descarta). Rótulos trocados: oeste x=-7 "west", leste x=7 "east". No eixo x o rótulo visível é o oposto do esperado (no eixo z não).

## Versão 1.8.14

- **Bosta amarela sem ícone, nome e sem comer**: o item estava com componentes no formato errado (`saturation_modifier: "poor"` e `use_animation` como texto), o que faz o jogo descartar o item inteiro. Agora segue o formato da maçã oficial: `saturation_modifier` 0,1; `use_animation: {"value": "eat"}`; `use_modifiers` com `start_using: always`; tag `minecraft:is_food`.

## Versão 1.9.0: bosta amarela no chão e sopa alucinógena

- **Colocar a bosta amarela**: o item agora tem `block_placer` (bloco `coco:coco_amarelo`, na face de cima de um bloco), então clicar num bloco coloca e só come quando você não mira um bloco (ou clica numa lateral onde não dá para colocar). Clicar com ela num montinho amarelo empilha até 5; também serve na composteira. A lógica de empilhar/compostar agora usa `ITEM_PARA_BLOCO` (item -> bloco).
- **Sopa no caldeirão**: clique com a bosta amarela num **caldeirão com água**: gasta 1 bosta e a água vira "sopa" (som, partícula e aviso na barra de ação). Como o Bedrock não deixa mudar a cor do líquido do caldeirão por script, o caldeirão **não muda de cor**: ele fica numa lista salva no mundo (`coco:caldeiroes_sopa`). Se esvaziar ou o caldeirão sumir, a marca some na próxima checagem.
- **Frasco**: clicar com **garrafa de vidro** num caldeirão de sopa dá o item `coco:sopa_bosta` (Sopa de bosta amarela, empilha 16; cada garrafa gasta 2 dos 6 níveis, então 3 frascos por caldeirão cheio).
- **Beber o frasco**: Náusea por 40 s (`DURACAO_ALUCINACAO_TICKS`) e uma onda de cor na tela a cada 6 s (`INTERVALO_CORES_TICKS`, paleta `CORES_ALUCINACAO`), feita com `/camera @s fade time 2 0 3 color r g b` (sobe em 2 s, desce em 3 s). Limitação: o fade do jogo chega a cobrir a tela inteira no pico, não dá para fazer só um tom leve. Devolve a garrafa de vidro.
- Ícone do frasco: garrafa de poção do jogo com o líquido tingido de amarelo-esverdeado (`textures/items/sopa_bosta.png`).
- Não testado: o `block_placer` convivendo com o comer, os estados `fill_level`/`cauldron_liquid` do caldeirão, o som `bottle.fill` e a fade da câmera.
- Testar: `/give @s coco:bosta_amarela 16`, encher um caldeirão com balde de água, clicar com a bosta, depois com uma `glass_bottle`.

## Versão 1.9.1: cor da sopa

- Correção do que escrevi na 1.9.0: o caldeirão do Bedrock tem líquidos coloridos (água tingida, poções), mas a cor/poção fica no **bloco-entidade** do caldeirão (`CauldronBlockActor`), que a API de script não expõe; o único estado de bloco é `cauldron_liquid` (água, lava, neve em pó). Só o próprio jogo (item de tintura ou poção) consegue colorir.
- Solução: entidade `coco:sopa_superficie` (um plano 12x12 px amarelo-esverdeado semitransparente, `entity_alphablend`) colocada na altura da água do caldeirão marcado como sopa. A altura segue o nível (`6 + 1,5 × nível` pixels, estimativa). Uma checagem por segundo recria a camada se o chunk recarregar e remove se o caldeirão esvaziar ou for quebrado.
- Não testado: a altura da camada em cada nível (pode flutuar ou afundar uns pixels) e a transparência.

## Versão 1.9.2: cores do frasco

- Onda de cor a cada 4 s (`INTERVALO_CORES_TICKS`) e sem chegar a 100%: a fade do jogo sempre sobe até a cor cheia, então ela é programada para subir em 3 s (`FADE_SUBIDA_S`) e é cortada com `/camera @s clear` quando chega a 35% (`PICO_COR`, ~1 s). A cor some de uma vez no corte (a fade não tem descida a partir de um valor parcial) e a próxima onda, com outra cor, vem 3 s depois. Para cores mais fortes, aumente `PICO_COR`; para mais suaves, diminua.

## Versão 1.9.3

- Corte da fade removido: a onda de cor vai até 100% e volta. A cada 4 s uma cor nova: sobe em 1,5 s (`FADE_SUBIDA_S`), desce em 2 s (`FADE_DESCIDA_S`). `PICO_COR` foi apagado.

## Versão 1.10: coco seca e bosta seca amassada

- **Coco normal vira bosta seca em 1 dia** (`SECAR_APOS_TICKS` = 24000, tempo do mundo). O bloco não tem relógio, então o script guarda no mundo (`coco:secar_em`) a posição e o tempo em que cada coco foi visto: quando a vaca solta, quando um jogador coloca, ou na primeira vez que o varredor de água/chuva (raio de 24 blocos dos jogadores) o encontra (cocos antigos do mundo começam a contar a partir daí). A cada 5 s os vencidos viram `coco:bosta_seca` com a mesma quantidade. Limite de 500 cocos na lista (descarta os mais antigos; a propriedade do mundo aceita ~32 mil caracteres). Só seca com o chunk carregado.
- **Pular em cima da bosta seca**: ao pousar (pé encosta no chão depois de estar no ar) sobre um bloco de bosta seca (checa o centro e 4 pontos a 0,3 bloco), ela vira uma mancha no chão (face de cima), com splash. Andar por cima sem pular não amassa. A bosta normal e a amarela não amassam.
- Não testado: se o pouso é detectado ao descer na bosta (o bloco só tem 3 px de altura), e se a contagem do dia segue o tempo do mundo com dormir.

## Versão 1.10.1: menos custo

- Limite de velocidade do coco: só roda quando há coco em voo (usa a lista `cocosEmVoo`, sem consultar o mundo todo tick).
- Varredura de água/chuva: a cada 1 s (`INTERVALO_AGUA_TICKS` = 20), raio 16 e altura ±8 (`RAIO_AGUA`, `ALTURA_AGUA`; antes 24 e ±12 a cada 0,5 s). As chances de chuva dobraram para o tempo de lavar continuar o mesmo (~10 s o coco, ~5 s a mancha).
- Vacas e fedor só olham as dimensões onde há jogador (`dimensoesAtivas()`).

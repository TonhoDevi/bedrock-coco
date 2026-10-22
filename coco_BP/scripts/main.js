import {
  world,
  system,
  BlockPermutation,
  ItemStack,
  BlockVolume,
  EntityDamageCause,
  EquipmentSlot,
  GameMode,
} from "@minecraft/server";

// ===== Ajustes (20 ticks = 1 segundo) =====
const VERIFICAR_VACAS_TICKS = 100; // de quanto em quanto tempo cada vaca "tenta" fazer coco (5 s)
const CHANCE_COCO = 1 / 6; // chance por tentativa: 1/6 a cada 5 s = em media 30 s de espera
const COOLDOWN_VACA_TICKS = 150 * 20; // depois de fazer coco, a vaca descansa 2,5 min (+ ~30 s de espera = ~3 min por coco)
const RAIO_AGUA = 16; // raio (horizontal) ao redor de cada jogador onde os cocos sao checados para agua
const ALTURA_AGUA = 8; // blocos para cima e para baixo
const INTERVALO_AGUA_TICKS = 20; // a cada 1 s
const CHANCE_CHUVA = 1 / 10; // chuva em cima do coco: chance a cada checagem de 1 s (~10 s ate lavar)
const RAIO_LIMITE = 8; // area (em blocos, para cada lado) onde os cocos sao contados
const MAX_COCOS_NA_AREA = 8; // se ja houver isso de blocos de coco na area, a vaca nao faz mais
const DURACAO_FEDOR_TICKS = 60 * 20; // 60 s fedendo
const DANO_COCO = 1; // 1 = meio coracao. Abaixo de 1 o jogo arredonda para 0 (sem dano e sem piscar vermelho)
const EMPURRAO_COCO = 0.25; // knockback horizontal do acerto (0 = sem empurrao)
// Velocidade e queda do arremesso: "power" e "gravity" em entities/coco_arremessado.json (e bosta_seca_arremessada.json).
// Distancia a frente do coco em que um bloco conta como "encostou". O coco para ~0,125 antes da superficie
// (metade da caixa de colisao 0,25), entao 0,25 pega o toque sem estourar no ar.
const MARGEM_IMPACTO = 0.25;
const ALTURA_MAXIMA_SUBIDA = 3.5; // o coco nao sobe mais que isso acima de onde saiu (jogada pra cima ia muito alto)
const TEMPO_MAXIMO_VOO_TICKS = 15 * 20; // nenhum coco voa mais que isso (evita ricochete infinito)
const VELOCIDADE_MAXIMA = 0.75; // limite (blocos/tick) para a queda nao acelerar demais
const INTERVALO_FEDOR_TICKS = 10; // a cada 0,5 s: particulas e contagem do fedor

const ITEM = "coco:coco";
const BLOCO = "coco:coco";
const ITEM_SECO = "coco:bosta_seca"; // mesmo comportamento do coco, mas mais dano e deixa mancha
const BLOCO_SECO = "coco:bosta_seca";
const PROJETIL_SECO = "coco:bosta_seca_arremessada";
const BLOCO_MANCHA = "coco:bosta_mancha";
const ESTADO_FACE = "coco:face"; // lado do bloco de apoio atingido: 0 cima, 1 baixo, 2 norte, 3 sul, 4 oeste, 5 leste
const DANO_SECO = 2; // 1 coracao (o coco normal faz meio)
const CHANCE_CHUVA_MANCHA = 1 / 5; // a mancha ao ar livre some mais rapido que o coco (~5 s de chuva)
const CHANCE_QUEBRAR_VIDRO = 0.35; // bosta seca em vidro/vidraca: chance de quebrar (se quebra, nao deixa mancha)
const TICKS_VOLTA_NO_JOGADOR = 8; // so depois disso o coco arremessado pode acertar quem arremessou (jogou pra cima e voltou)
const BLOCO_AMARELO = "coco:coco_amarelo";
const ITEM_AMARELO = "coco:bosta_amarela"; // comestivel, nao pode ser arremessado
const VACA_AMARELA = "coco:vaca_amarela";
const CHANCE_VACA_AMARELA = 1 / 20; // chance de uma vaca adulta nascer (spawn natural/ovo) ja como vaca amarela
const DURACAO_NAUSEA_TICKS = 15 * 20; // nausea ao comer a bosta amarela
const ESTADO = "coco:quantidade";
const MAX_PILHA = 5; // o nivel 5 e o "coco grandao"
// Quantidade sorteada quando a vaca faz coco: [quantidade, peso]
const SORTEIO_QUANTIDADE = [[1, 35], [2, 30], [3, 20], [4, 12], [5, 3]];
const VOLUME_DIARREIA = 6; // volume acima de 1 aumenta a distancia em que o som da vaca e ouvido
const CHANCE_COMPOSTEIRA = 0.5; // chance de cada coco subir 1 nivel da composteira (vanilla: 30% a 100%)
const PROJETIL = "coco:coco_arremessado";
const PROJETEIS = new Set([PROJETIL, PROJETIL_SECO]);
const PARTICULA = "coco:fedor";
const PARTICULA_SPLASH = "coco:splash";
const TAG_FEDOR = "coco_fedendo"; // usada tambem no entities/villager_v2.json
const PROP_FEDOR = "coco:fedor_restante";
const PROP_ULTIMO_COCO = "coco:ultimo_coco";
const ITEM_SOPA = "coco:sopa_bosta"; // frasco de sopa de bosta amarela (alucinogeno)
const GARRAFA = "minecraft:glass_bottle";
const DURACAO_ALUCINACAO_TICKS = 40 * 20;
const INTERVALO_CORES_TICKS = 4 * 20; // de quanto em quanto tempo vem uma onda de cor
const FADE_SUBIDA_S = 1.5; // a fade sobe ate 100% da cor, segura 0 s e desce
const FADE_DESCIDA_S = 2;
const CORES_ALUCINACAO = [[255, 0, 200], [0, 255, 200], [255, 220, 0], [140, 0, 255], [0, 150, 255], [255, 90, 0]];
const SUPERFICIE = "coco:sopa_superficie"; // camada colorida desenhada sobre a agua do caldeirao
const SECAR_APOS_TICKS = 24000; // 1 dia do Minecraft: coco normal vira bosta seca
const INTERVALO_SECAR_TICKS = 100;
const MAX_COCOS_RASTREADOS = 500; // limite da lista salva no mundo (a propriedade aceita ~32 mil caracteres)
const PROP_SECAR = "coco:secar_em";
const PROP_SOPAS = "coco:caldeiroes_sopa";
const VACAS = ["minecraft:cow", "minecraft:mooshroom", VACA_AMARELA];
const DIMENSOES = ["overworld", "nether", "the_end"];

const ITENS_ARREMESSAVEIS = new Map([[ITEM, PROJETIL], [ITEM_SECO, PROJETIL_SECO]]); // item -> projetil
const ITEM_PARA_BLOCO = new Map([[ITEM, BLOCO], [ITEM_SECO, BLOCO_SECO], [ITEM_AMARELO, BLOCO_AMARELO]]); // item que empilha/compostavel -> bloco
const cocosEmVoo = new Map(); // id do projetil -> { coco, dono, tick, ultima, passo }
// So as dimensoes com jogador importam (o resto nem esta carregado).
function dimensoesAtivas() {
  const ids = new Set(world.getAllPlayers().map((p) => p.dimension.id.replace("minecraft:", "")));
  return DIMENSOES.filter((id) => ids.has(id));
}
const ultimoCliqueEmBloco = new Map(); // player.id -> tick

function sortearQuantidade() {
  let r = Math.random() * SORTEIO_QUANTIDADE.reduce((t, [, peso]) => t + peso, 0);
  for (const [qtd, peso] of SORTEIO_QUANTIDADE) {
    if ((r -= peso) < 0) return qtd;
  }
  return 1;
}

// ===== Vacas fazendo coco =====
system.runInterval(() => {
  const agora = world.getAbsoluteTime();
  for (const id of dimensoesAtivas()) {
    const dim = world.getDimension(id);
    for (const type of VACAS) {
      for (const vaca of dim.getEntities({ type })) {
        if (Math.random() >= CHANCE_COCO || vaca.getComponent("minecraft:is_baby")) continue;
        const ultimo = vaca.getDynamicProperty(PROP_ULTIMO_COCO);
        // agora < ultimo acontece se o tempo do mundo for alterado; nesse caso ignora o cooldown
        if (typeof ultimo === "number" && agora >= ultimo && agora - ultimo < COOLDOWN_VACA_TICKS) continue;
        if (fazerCoco(vaca)) vaca.setDynamicProperty(PROP_ULTIMO_COCO, agora);
      }
    }
  }
}, VERIFICAR_VACAS_TICKS);

// Vaca amarela solta bloco amarelo; as outras, o coco normal.
function fazerCoco(vaca) {
  const tipoBloco = vaca.typeId === VACA_AMARELA ? BLOCO_AMARELO : BLOCO;
  if (!vaca.isOnGround) return false;
  const dim = vaca.dimension;
  const pos = { x: Math.floor(vaca.location.x), y: Math.floor(vaca.location.y), z: Math.floor(vaca.location.z) };
  try {
    const bloco = dim.getBlock(pos);
    const chao = bloco?.below();
    if (!bloco?.isAir || !chao || chao.isAir || chao.isLiquid || chao.typeId === BLOCO || chao.typeId === BLOCO_AMARELO || chao.typeId === BLOCO_SECO) return false;

    const r = RAIO_LIMITE;
    const area = new BlockVolume(
      { x: pos.x - r, y: Math.max(pos.y - 4, dim.heightRange.min), z: pos.z - r },
      { x: pos.x + r, y: Math.min(pos.y + 4, dim.heightRange.max - 1), z: pos.z + r }
    );
    if (dim.getBlocks(area, { includeTypes: [BLOCO, BLOCO_AMARELO, BLOCO_SECO] }, false).getCapacity() >= MAX_COCOS_NA_AREA) return false;

    bloco.setPermutation(BlockPermutation.resolve(tipoBloco, { [ESTADO]: sortearQuantidade() }));
    dim.playSound("coco.diarreia", bloco.center(), { volume: VOLUME_DIARREIA });
    if (tipoBloco === BLOCO) rastrearCoco(bloco);
    return true;
  } catch {
    return false; // area com chunk nao carregado, fora do limite do mundo etc.
  }
}

// ===== Vaca amarela (rara): troca a vaca recem-surgida por uma amarela =====
world.afterEvents.entitySpawn.subscribe(({ entity, cause }) => {
  if (cause !== "Spawned" || entity.typeId !== "minecraft:cow" || Math.random() >= CHANCE_VACA_AMARELA) return;
  const { dimension, location } = entity;
  system.run(() => {
    if (!entity.isValid) return;
    try {
      const nova = dimension.spawnEntity(VACA_AMARELA, location);
      nova.nameTag = entity.nameTag;
      entity.remove();
    } catch {}
  });
});

// ===== Comer a bosta amarela: da nausea (a fome vem do proprio item) =====
world.afterEvents.itemCompleteUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId !== ITEM_AMARELO || source.typeId !== "minecraft:player") return;
  source.addEffect("nausea", DURACAO_NAUSEA_TICKS);
});

// ===== Empilhar: clicar com o item no bloco de coco =====
world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  ultimoCliqueEmBloco.set(ev.player.id, system.currentTick);
  const item = ev.itemStack?.typeId;
  const { player, block } = ev;
  if (item === ITEM_AMARELO && block.typeId === CALDEIRAO) {
    ev.cancel = true; // nem colocar nem comer: vira sopa
    if (ev.isFirstEvent) system.run(() => fazerSopa(player, block));
    return;
  }
  if (item === GARRAFA && block.typeId === CALDEIRAO && ehSopa(block)) {
    ev.cancel = true;
    if (ev.isFirstEvent) system.run(() => engarrafarSopa(player, block));
    return;
  }
  if (ITEM_PARA_BLOCO.has(item) && block.typeId === "minecraft:composter") {
    ev.cancel = true; // o block_placer nao pode colocar coco na composteira
    if (ev.isFirstEvent) system.run(() => compostar(player, block));
    return;
  }
  if (!ITEM_PARA_BLOCO.has(item) || block.typeId !== ITEM_PARA_BLOCO.get(item)) return;
  ev.cancel = true; // impede o block_placer de colocar outro em cima
  if (ev.isFirstEvent) system.run(() => empilhar(player, block, item));
});

function empilhar(player, block, item) {
  if (!player.isValid || !block.isValid) return;
  const n = block.permutation.getState(ESTADO);
  if (typeof n !== "number" || n >= MAX_PILHA) return;
  if (!gastarItem(player, item)) return;
  block.setPermutation(block.permutation.withState(ESTADO, n + 1));
  block.dimension.playSound("block.mud.place", block.center());
}

// ===== Sopa de bosta amarela no caldeirao =====
// O Bedrock nao deixa dar cor/liquido novo ao caldeirao por script, entao o caldeirao com agua fica
// "marcado" (lista salva no mundo) e a garrafa de vidro nele rende o frasco de sopa.
const CALDEIRAO = "minecraft:cauldron";
let sopas;
function listaSopas() {
  if (!sopas) {
    try {
      sopas = new Set(JSON.parse(String(world.getDynamicProperty(PROP_SOPAS) ?? "[]")));
    } catch {
      sopas = new Set();
    }
  }
  return sopas;
}
function marcaSopa(block, ligar) {
  const chave = `${block.dimension.id}|${block.x}|${block.y}|${block.z}`;
  const lista = listaSopas();
  if (ligar) lista.add(chave);
  else lista.delete(chave);
  world.setDynamicProperty(PROP_SOPAS, JSON.stringify([...lista]));
  if (ligar) atualizarSuperficie(block);
  else removerSuperficie(block);
}

// A cor do liquido do caldeirao fica no bloco-entidade, que a API de script nao alcanca. Entao a sopa
// ganha uma entidade chata (so um plano colorido) na altura da agua, que acompanha o nivel do caldeirao.
function centroAgua(block) {
  const nivel = Number(block.permutation.getState("fill_level")) || 1;
  return { x: block.x + 0.5, y: block.y + (6 + 1.5 * nivel) / 16 + 0.005, z: block.z + 0.5 };
}
function superficiesDe(block) {
  return block.dimension.getEntities({ type: SUPERFICIE, location: { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 }, maxDistance: 1 });
}
function atualizarSuperficie(block) {
  try {
    const pos = centroAgua(block);
    const [primeira, ...sobras] = superficiesDe(block);
    sobras.forEach((e) => e.remove());
    if (!primeira) block.dimension.spawnEntity(SUPERFICIE, pos);
    else if (Math.abs(primeira.location.y - pos.y) > 0.01) primeira.teleport(pos);
  } catch {}
}
function removerSuperficie(block) {
  try {
    superficiesDe(block).forEach((e) => e.remove());
  } catch {}
}
// 1x por segundo: refaz/remove a camada (chunk recarregado, caldeirao esvaziado ou quebrado)
system.runInterval(() => {
  for (const chave of [...listaSopas()]) {
    const [dimId, x, y, z] = chave.split("|");
    try {
      const block = world.getDimension(dimId).getBlock({ x: Number(x), y: Number(y), z: Number(z) });
      if (!block) continue; // chunk nao carregado
      if (block.typeId === CALDEIRAO && ehSopa(block)) atualizarSuperficie(block);
      else {
        removerSuperficie(block);
        if (block.typeId !== CALDEIRAO) marcaSopa(block, false);
      }
    } catch {}
  }
}, 20);
function temAgua(block) {
  const nivel = block.permutation.getState("fill_level");
  return block.permutation.getState("cauldron_liquid") === "water" && typeof nivel === "number" && nivel > 0;
}
function ehSopa(block) {
  const chave = `${block.dimension.id}|${block.x}|${block.y}|${block.z}`;
  if (!listaSopas().has(chave)) return false;
  if (temAgua(block)) return true;
  marcaSopa(block, false); // esvaziou ou virou outra coisa
  return false;
}

function fazerSopa(player, block) {
  if (!player.isValid || !block.isValid || block.typeId !== CALDEIRAO || !temAgua(block) || ehSopa(block)) return;
  if (!gastarItem(player, ITEM_AMARELO)) return;
  marcaSopa(block, true);
  const c = block.center();
  block.dimension.playSound("random.fizz", c, { volume: 0.8 });
  block.dimension.playSound("mob.slime.big", c, { volume: 0.6 });
  block.dimension.spawnParticle("minecraft:crop_growth_emitter", { x: c.x, y: c.y + 0.4, z: c.z });
  player.onScreenDisplay.setActionBar({ translate: "coco.sopa_pronta" });
}

function engarrafarSopa(player, block) {
  if (!player.isValid || !block.isValid || !ehSopa(block)) return;
  if (!gastarItem(player, GARRAFA)) return;
  const nivel = Number(block.permutation.getState("fill_level")) - 2; // uma garrafa tira 2 de 6 niveis
  if (nivel <= 0) {
    block.setPermutation(block.permutation.withState("fill_level", 0));
    marcaSopa(block, false);
  } else {
    block.setPermutation(block.permutation.withState("fill_level", nivel));
    atualizarSuperficie(block);
  }
  const frasco = new ItemStack(ITEM_SOPA, 1);
  const sobra = player.getComponent("minecraft:inventory")?.container?.addItem(frasco);
  if (sobra) player.dimension.spawnItem(sobra, player.location);
  block.dimension.playSound("bottle.fill", block.center());
}

// ===== Beber o frasco: alucinogeno (nausea + ondas de cor na tela) =====
world.afterEvents.itemCompleteUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId !== ITEM_SOPA || source.typeId !== "minecraft:player") return;
  alucinar(source);
});

function alucinar(player) {
  player.addEffect("nausea", DURACAO_ALUCINACAO_TICKS);
  let resta = DURACAO_ALUCINACAO_TICKS;
  const onda = () => {
    if (!player.isValid || resta <= 0) return;
    const [r, g, b] = CORES_ALUCINACAO[Math.floor(Math.random() * CORES_ALUCINACAO.length)];
    try {
      player.runCommand(`camera @s fade time ${FADE_SUBIDA_S} 0 ${FADE_DESCIDA_S} color ${r} ${g} ${b}`);
    } catch {}
    resta -= INTERVALO_CORES_TICKS;
    system.runTimeout(onda, INTERVALO_CORES_TICKS);
  };
  onda();
}

// Coco na composteira: como os itens vanilla, so sobe de nivel com certa chance. Nivel 8 = pronta.
function compostar(player, block) {
  if (!player.isValid || !block.isValid || block.typeId !== "minecraft:composter") return;
  const nivel = block.permutation.getState("composter_fill_level");
  if (typeof nivel !== "number" || nivel >= 7) return;
  const tipo = player.getComponent("minecraft:equippable")?.getEquipmentSlot(EquipmentSlot.Mainhand).getItem()?.typeId;
  if (!ITEM_PARA_BLOCO.has(tipo) || !gastarItem(player, tipo)) return;
  const centro = block.center();
  if (Math.random() >= CHANCE_COMPOSTEIRA) {
    block.dimension.playSound("block.composter.fill", centro);
    return;
  }
  block.setPermutation(block.permutation.withState("composter_fill_level", nivel + 1));
  block.dimension.playSound("block.composter.fill_success", centro);
  block.dimension.spawnParticle("minecraft:crop_growth_emitter", { x: centro.x, y: centro.y + 0.3, z: centro.z });
  if (nivel + 1 === 7) {
    system.runTimeout(() => {
      if (!block.isValid || block.typeId !== "minecraft:composter") return;
      if (block.permutation.getState("composter_fill_level") !== 7) return;
      block.setPermutation(block.permutation.withState("composter_fill_level", 8));
      block.dimension.playSound("block.composter.ready", centro);
    }, 20);
  }
}

// Tira 1 coco da mao (nada no criativo). Retorna false se o item nao esta mais na mao.
function gastarItem(player, tipo = ITEM) {
  const slot = player.getComponent("minecraft:equippable")?.getEquipmentSlot(EquipmentSlot.Mainhand);
  const item = slot?.getItem();
  if (item?.typeId !== tipo) return false;
  if (player.getGameMode() === GameMode.Creative) return true;
  if (item.amount > 1) slot.amount = item.amount - 1;
  else slot.setItem(undefined);
  return true;
}

// Com o jogo lancando sozinho (throwable), clicar num bloco colocaria E arremessaria. Cancela o arremesso
// quando o clique foi num bloco (evento de bloco no mesmo tick) ou quando ha bloco ao alcance na mira.
const ALCANCE_BLOCO = 6;
world.beforeEvents.itemUse.subscribe((ev) => {
  if (!ITENS_ARREMESSAVEIS.has(ev.itemStack?.typeId)) return;
  const { source: player } = ev;
  if ((ultimoCliqueEmBloco.get(player.id) ?? -100) >= system.currentTick - 2) {
    ev.cancel = true;
    return;
  }
  try {
    if (player.getBlockFromViewDirection({ maxDistance: ALCANCE_BLOCO })) ev.cancel = true;
  } catch {}
});

// ===== Arremessar: usar o item no ar =====
// Quem arremessa e o proprio jogo (componente minecraft:throwable do item, que tambem faz o braco do
// jogador balancar). Ao clicar num bloco o block_placer age primeiro e coloca o coco. O script so
// registra o projetil criado, para o coco poder voltar no dono (jogado para cima).
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (!PROJETEIS.has(entity.typeId)) return;
  const tick = system.currentTick;
  system.run(() => {
    if (!entity.isValid) return;
    const dono = entity.getComponent("minecraft:projectile")?.owner;
    cocosEmVoo.set(entity.id, { coco: entity, dono: dono?.typeId === "minecraft:player" ? dono : undefined, tick });
  });
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  ultimoCliqueEmBloco.delete(playerId);
});

// ===== Acerto do coco =====
// Dano em qualquer criatura com vida (vaca, aldeao, monstro, jogador). Tenta o dano normal do jogo
// (piscar vermelho e som); se nao tirou vida, tenta de outras formas e por fim tira a vida direto.
function causarDano(alvo, autor, projetil, dano = DANO_COCO) {
  const vida = alvo.getComponent("minecraft:health");
  if (!vida) return false;
  const antes = vida.currentValue;
  const tentativas = [
    () => {
      const o = { cause: EntityDamageCause.projectile };
      if (autor?.isValid) o.damagingEntity = autor;
      if (projetil?.isValid) o.damagingProjectile = projetil;
      return alvo.applyDamage(dano, o);
    },
    () => alvo.applyDamage(dano, { cause: EntityDamageCause.entityAttack }),
    () => alvo.applyDamage(dano),
  ];
  for (const t of tentativas) {
    try {
      t();
    } catch {}
    if (!alvo.isValid || vida.currentValue < antes) return true;
  }
  try {
    vida.setCurrentValue(Math.max(vida.effectiveMin, antes - dano));
    return true;
  } catch {
    return false;
  }
}

// Limite de velocidade do coco em voo: sem isso a queda acelera e ele fica rapido demais.
// So trabalha quando ha coco no ar (lista cocosEmVoo), sem varrer o mundo.
system.runInterval(() => {
  if (cocosEmVoo.size === 0) return;
  for (const { coco } of cocosEmVoo.values()) {
    try {
      if (!coco.isValid) continue;
      const v = coco.getVelocity();
      const vel = Math.hypot(v.x, v.y, v.z);
      if (vel <= VELOCIDADE_MAXIMA) continue;
      const k = VELOCIDADE_MAXIMA / vel;
      coco.clearVelocity();
      coco.applyImpulse({ x: v.x * k, y: v.y * k, z: v.z * k });
    } catch {}
  }
}, 1);

world.afterEvents.projectileHitEntity.subscribe((ev) => {
  if (!PROJETEIS.has(ev.projectile.typeId)) return;
  const dano = danoDe(ev.projectile.typeId);
  if (!prenderNoImpacto(ev.projectile, ev.location)) return;
  splash(ev.dimension, ev.location);
  acertarAlvo(dano, ev.getEntityHit()?.entity, ev.source, ev.hitVector);
});

// Fedor + dano + empurrao num alvo atingido (pelo jogo ou pela volta do coco no proprio jogador).
const danoDe = (tipo) => (tipo === PROJETIL_SECO ? DANO_SECO : DANO_COCO);
function acertarAlvo(dano, alvo, autor, direcao) {
  if (!alvo?.isValid || !alvo.getComponent("minecraft:health")) return;
  ficarFedendo(alvo); // antes do dano: vale mesmo se o alvo for invulneravel ou morrer
  try {
    if (causarDano(alvo, autor, undefined, dano) && EMPURRAO_COCO > 0 && alvo.isValid) {
      const { x, z } = direcao;
      const len = Math.hypot(x, z) || 1;
      alvo.applyKnockback({ x: (x / len) * EMPURRAO_COCO, z: (z / len) * EMPURRAO_COCO }, 0.15);
    }
  } catch {}
}

// Vigia dos cocos em voo (1x por tick):
// - jogou pra cima: o coco que desce em cima de quem arremessou acerta o proprio jogador (o jogo ignora
//   o dono do projetil, entao a checagem e feita aqui);
// - rede de seguranca: se o jogo nao avisou o impacto (batida em angulo estranho) e o coco parou ou voltou
//   para tras, conta como impacto; e nenhum coco voa mais que TEMPO_MAXIMO_VOO_TICKS.
// A subida/descida vem da posicao do tick anterior, sem depender do getVelocity do projetil.
system.runInterval(() => {
  for (const [id, info] of cocosEmVoo) {
    const { dono, coco, tick } = info;
    if (!coco?.isValid || coco.hasTag("coco_usado")) {
      cocosEmVoo.delete(id);
      continue;
    }
    const idade = system.currentTick - tick;
    const c = coco.location;
    const antes = info.ultima ?? c;
    const passo = { x: c.x - antes.x, y: c.y - antes.y, z: c.z - antes.z };
    const anterior = info.passo;
    info.ultima = { x: c.x, y: c.y, z: c.z };
    info.passo = passo;
    if (idade > TEMPO_MAXIMO_VOO_TICKS) {
      cocosEmVoo.delete(id);
      coco.remove();
      continue;
    }
    info.y0 ??= c.y;
    if (!info.limitado && passo.y > 0 && c.y - info.y0 > ALTURA_MAXIMA_SUBIDA) {
      // chegou no teto da subida: zera a subida e mantem o resto (horizontal); a gravidade faz cair
      info.limitado = true;
      info.ignorarAte = system.currentTick + 5;
      info.passo = undefined;
      try {
        coco.clearVelocity();
        coco.applyImpulse({ x: passo.x, y: 0, z: passo.z });
      } catch {}
      continue;
    }
    const dist = Math.hypot(passo.x, passo.y, passo.z);
    if (idade >= 2 && dist > 0.05 && blocoAFrente(coco, c, passo, dist)) {
      // vai bater no proximo tick: resolve o impacto agora, antes de o jogo deixar o coco deslizar na parede
      cocosEmVoo.delete(id);
      impactoSemAviso(coco, c, passo);
      continue;
    }
    if (idade >= 3 && system.currentTick >= (info.ignorarAte ?? 0)) {
      const volta = anterior && passo.x * anterior.x + passo.y * anterior.y + passo.z * anterior.z < 0;
      if (dist < 0.02 || volta) {
        cocosEmVoo.delete(id);
        impactoSemAviso(coco, antes, anterior ?? passo);
        continue;
      }
    }
    if (!dono || !dono.isValid || idade < TICKS_VOLTA_NO_JOGADOR || coco.dimension.id !== dono.dimension.id) continue;
    if (passo.y >= 0) continue; // so conta descendo
    const p = dono.location;
    if (Math.hypot(c.x - p.x, c.z - p.z) > 0.7 || c.y < p.y - 0.3 || c.y > p.y + 2.0) continue;
    cocosEmVoo.delete(id);
    const dim = coco.dimension;
    const dano = danoDe(coco.typeId);
    if (!prenderNoImpacto(coco, c)) continue;
    splash(dim, c);
    acertarAlvo(dano, dono, dono, { x: passo.x, z: passo.z });
  }
}, 1);

// Ha bloco (solido, nao liquido) no caminho do proximo passo do coco?
function blocoAFrente(coco, pos, passo, dist) {
  try {
    const dir = { x: passo.x / dist, y: passo.y / dist, z: passo.z / dist };
    return !!coco.dimension.getBlockFromRay(pos, dir, { maxDistance: MARGEM_IMPACTO, includeLiquidBlocks: false });
  } catch {
    return false;
  }
}

// Impacto que o jogo nao avisou: acha o bloco na direcao em que o coco vinha e faz o mesmo que um impacto normal.
function impactoSemAviso(coco, origem, passo) {
  try {
    const len = Math.hypot(passo.x, passo.y, passo.z) || 1;
    const dir = { x: passo.x / len, y: passo.y / len, z: passo.z / len };
    const dim = coco.dimension;
    const local = coco.location;
    const seco = coco.typeId === PROJETIL_SECO;
    if (!prenderNoImpacto(coco, local)) return;
    splash(dim, local);
    if (!seco) return;
    const hit = dim.getBlockFromRay(origem, dir, { maxDistance: MARGEM_IMPACTO + 0.5, includeLiquidBlocks: false });
    if (!hit) return;
    const { block, face, faceLocation } = hit;
    manchar({ block, face }, { x: block.x + faceLocation.x, y: block.y + faceLocation.y, z: block.z + faceLocation.z });
  } catch (e) {
    console.warn(`coco: impactoSemAviso falhou: ${e}`);
  }
}

world.afterEvents.projectileHitBlock.subscribe((ev) => {
  if (!PROJETEIS.has(ev.projectile.typeId)) return;
  const seco = ev.projectile.typeId === PROJETIL_SECO;
  if (!prenderNoImpacto(ev.projectile, ev.location)) return;
  splash(ev.dimension, ev.location);
  if (seco) manchar(ev.getBlockHit(), ev.location);
});

// Bosta seca batendo num bloco deixa uma mancha na face atingida (como a trepadeira, so naquela face).
const FACES_MANCHA = { Up: 0, Down: 1, North: 2, South: 3, West: 4, East: 5 };
const NORMAIS = [[0, 1, 0], [0, -1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]];
const NAO_QUADRADO = new RegExp(
  "(^|[:_])(" +
    [
      "carpet", "stairs", "slab", "fence", "wall", "trapdoor", "door", "pane", "bars", "button", "pressure",
      "plate", "sign", "torch", "lantern", "chain", "rail", "flower", "short", "tall", "fern", "sapling", "vine",
      "bush", "crop", "candle", "cake", "bed", "chest", "anvil", "lever", "skull", "head", "banner", "hopper",
      "cauldron", "composter", "brewing", "enchanting", "daylight", "lectern", "grindstone", "bell", "campfire",
      "pot", "layer", "azalea", "scaffolding", "ladder", "rod", "dripstone", "amethyst", "coral", "pickle", "egg",
      "frogspawn", "litter", "petals", "mushroom", "roots", "sprouts", "wart", "kelp", "seagrass", "cactus",
      "berry", "stonecutter", "conduit", "beacon", "piston", "repeater", "comparator", "tripwire", "wire",
      "cocoa", "lichen", "chorus", "bamboo", "cane", "reeds", "web", "cobweb", "farmland", "path", "lava", "water",
      "snow_layer", "lightning", "tripwire_hook", "heavy_core", "vault", "dragon_egg", "gateway", "portal", "fire",
    ].join("|") +
    ")($|_)"
);
const VIDROS = /^minecraft:([a-z_]+_)?(glass|glass_pane)$/;

// A face atingida precisa ser de um bloco quadrado inteiro (nada de tapete, mato, escada, laje, cerca...):
// o ponto do impacto tem de estar exatamente na borda da celula do bloco e o nome nao pode ser de bloco "quebrado".
function faceQuadrada(block, i, local) {
  if (NAO_QUADRADO.test(block.typeId) || block.isLiquid) return false;
  const [dx, dy, dz] = NORMAIS[i];
  const borda = [block.x + (dx > 0 ? 1 : 0), block.y + (dy > 0 ? 1 : 0), block.z + (dz > 0 ? 1 : 0)];
  const eixo = dx ? 0 : dy ? 1 : 2;
  return Math.abs([local.x, local.y, local.z][eixo] - borda[eixo]) < 0.12;
}

function manchar({ block, face }, local) {
  try {
    const i = FACES_MANCHA[face];
    if (i === undefined || !block.isValid || block.isAir) return;
    if (VIDROS.test(block.typeId) && Math.random() < CHANCE_QUEBRAR_VIDRO) {
      block.dimension.runCommand(`setblock ${block.x} ${block.y} ${block.z} air destroy`);
      return;
    }
    if (!faceQuadrada(block, i, local)) return;
    const [dx, dy, dz] = NORMAIS[i];
    const alvo = block.dimension.getBlock({ x: block.x + dx, y: block.y + dy, z: block.z + dz });
    if (!alvo?.isAir) return;
    alvo.setPermutation(BlockPermutation.resolve(BLOCO_MANCHA, { [ESTADO_FACE]: i }));
  } catch {}
}

// Remove o coco na hora do impacto. Retorna false se ja tinha batido (evita dano em dobro).
// Depois de chamar, nao leia mais nada da entidade (ja foi removida): pegue dimensao e tipo antes.
function prenderNoImpacto(coco, local) {
  if (!coco.isValid || coco.hasTag("coco_usado")) return false;
  coco.addTag("coco_usado");
  try {
    coco.clearVelocity(); // sem prender/teleportar: o coco some na hora e nao desliza na parede
    coco.remove();
  } catch {}
  return true;
}

function splash(dim, local) {
  try {
    dim.spawnParticle(PARTICULA_SPLASH, local);
    dim.spawnParticle(PARTICULA, local);
    dim.playSound("coco.splash", local, { volume: 1 });
  } catch {}
}

// ===== Efeito "Fedendo" (tag + tempo restante em dynamic property) =====
function ficarFedendo(ent) {
  ent.setDynamicProperty(PROP_FEDOR, DURACAO_FEDOR_TICKS); // reinicia se ja estava fedendo
  ent.addTag(TAG_FEDOR);
  if (ent.typeId === "minecraft:player") {
    ent.onScreenDisplay.setActionBar({ translate: "coco.fedendo" });
    ent.playSound("mob.slime.big", { volume: 0.7 });
  }
}

function limparFedor(ent, avisar) {
  ent.removeTag(TAG_FEDOR);
  ent.setDynamicProperty(PROP_FEDOR, undefined);
  if (avisar && ent.typeId === "minecraft:player") {
    ent.onScreenDisplay.setActionBar({ translate: "coco.passou" });
    ent.playSound("random.fizz", { volume: 0.4 });
  }
}

function naAgua(ent) {
  if (ent.isInWater || ent.isSwimming) return true;
  const { x, y, z } = ent.location;
  let pe;
  try {
    pe = ent.dimension.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) })?.typeId;
  } catch {}
  return pe === "minecraft:water" || pe === "minecraft:flowing_water";
}

system.runInterval(() => {
  for (const id of dimensoesAtivas()) {
    for (const ent of world.getDimension(id).getEntities({ tags: [TAG_FEDOR] })) {
      const resta = Number(ent.getDynamicProperty(PROP_FEDOR) ?? 0) - INTERVALO_FEDOR_TICKS;
      if (resta <= 0 || naAgua(ent)) {
        limparFedor(ent, true);
        continue;
      }
      ent.setDynamicProperty(PROP_FEDOR, resta);
      const pe = ent.location;
      const cabeca = ent.getHeadLocation();
      try {
        ent.dimension.spawnParticle(PARTICULA, { x: pe.x, y: (pe.y + cabeca.y) / 2 + 0.2, z: pe.z });
      } catch {}
    }
  }
}, INTERVALO_FEDOR_TICKS);

// Morrer, sair e voltar ao mundo: o fedor some
world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity.typeId === "minecraft:player" && deadEntity.isValid) limparFedor(deadEntity, false);
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  if (player.hasTag(TAG_FEDOR)) limparFedor(player, false);
});

// Chuva: o evento diz quando o tempo muda (a API estavel nao deixa consultar o tempo atual,
// entao um mundo carregado no meio de uma chuva so a "ve" na proxima mudanca).
let chovendo = false;
world.afterEvents.weatherChange.subscribe(({ newWeather }) => {
  chovendo = newWeather !== "Clear";
});

// ===== Agua quebra o coco (solta os itens, como cultivos no Java) =====
const FACES_AGUA = [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    try {
      const dim = player.dimension;
      const p = player.location;
      const r = RAIO_AGUA;
      const area = new BlockVolume(
        { x: Math.floor(p.x) - r, y: Math.max(Math.floor(p.y) - ALTURA_AGUA, dim.heightRange.min), z: Math.floor(p.z) - r },
        { x: Math.floor(p.x) + r, y: Math.min(Math.floor(p.y) + ALTURA_AGUA, dim.heightRange.max - 1), z: Math.floor(p.z) + r }
      );
      for (const loc of dim.getBlocks(area, { includeTypes: [BLOCO, BLOCO_AMARELO, BLOCO_SECO, BLOCO_MANCHA] }, false).getBlockLocationIterator()) {
        const mancha = dim.getBlock(loc);
        if (mancha?.typeId === BLOCO) rastrearCoco(mancha);
        const face = mancha?.typeId === BLOCO_MANCHA ? mancha.permutation.getState(ESTADO_FACE) : undefined;
        if (typeof face === "number") {
          // mancha some se o bloco de apoio sumir
          const [nx, ny, nz] = NORMAIS[face];
          const apoio = dim.getBlock({ x: loc.x - nx, y: loc.y - ny, z: loc.z - nz });
          if (apoio?.isAir || apoio?.isLiquid) {
            mancha.setPermutation(BlockPermutation.resolve("minecraft:air"));
            continue;
          }
        }
        const molhado = FACES_AGUA.some(([dx, dy, dz]) => {
          const viz = dim.getBlock({ x: loc.x + dx, y: loc.y + dy, z: loc.z + dz });
          return viz?.isLiquid || viz?.typeId === "minecraft:water" || viz?.typeId === "minecraft:flowing_water";
        });
        const lavado =
          chovendo &&
          dim.id === "minecraft:overworld" &&
          Math.random() < (typeof face === "number" ? CHANCE_CHUVA_MANCHA : CHANCE_CHUVA) &&
          (dim.getTopmostBlock({ x: loc.x, z: loc.z })?.location.y ?? loc.y) <= loc.y;
        if (molhado || lavado) {
          dim.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air${typeof face === "number" ? "" : " destroy"}`);
          dim.playSound("block.mud.break", { x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 });
        }
      }
    } catch {}
  }
}, INTERVALO_AGUA_TICKS);

// ===== Teste da mancha: /scriptevent coco:teste_mancha =====
// Monta uma torre 3x3x3 a 5 blocos de leste de quem digitou. No meio de cada lado ha um bloco colorido
// (norte vermelho, sul azul, oeste amarelo, leste verde) com a mancha do lado correspondente na frente.
system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
  if (id !== "coco:teste_mancha" || !sourceEntity?.isValid) return;
  const dim = sourceEntity.dimension;
  const x = Math.floor(sourceEntity.location.x) + 5;
  const y = Math.floor(sourceEntity.location.y);
  const z = Math.floor(sourceEntity.location.z);
  try {
    dim.runCommand(`fill ${x - 3} ${y} ${z - 3} ${x + 3} ${y + 3} ${z + 3} air`);
    dim.runCommand(`fill ${x - 3} ${y - 1} ${z - 3} ${x + 3} ${y - 1} ${z + 3} stone`);
    dim.runCommand(`fill ${x - 1} ${y} ${z - 1} ${x + 1} ${y + 2} ${z + 1} white_concrete`);
    const lados = [
      ["red_concrete", 0, -1, 2], // norte
      ["blue_concrete", 0, 1, 3], // sul
      ["yellow_concrete", -1, 0, 4], // oeste
      ["lime_concrete", 1, 0, 5], // leste
    ];
    for (const [cor, dx, dz, face] of lados) {
      dim.runCommand(`setblock ${x + dx} ${y + 1} ${z + dz} ${cor}`);
      dim.runCommand(`setblock ${x + dx * 2} ${y + 1} ${z + dz * 2} ${BLOCO_MANCHA} ["${ESTADO_FACE}"=${face}]`);
    }
  } catch (e) {
    console.warn(`coco: teste_mancha falhou: ${e}`);
  }
});

// ===== Coco normal seca depois de 1 dia =====
// O bloco nao tem relogio proprio, entao guardamos no mundo "onde" e "quando" (tempo do mundo) cada coco
// foi visto pela primeira vez. A cada 5 s os que ja passaram de SECAR_APOS_TICKS viram bosta seca.
let rastreados;
let rastreadosSujo = false;
function listaRastreados() {
  if (!rastreados) {
    try {
      rastreados = new Map(Object.entries(JSON.parse(String(world.getDynamicProperty(PROP_SECAR) ?? "{}"))));
    } catch {
      rastreados = new Map();
    }
  }
  return rastreados;
}
const chaveDe = (b) => `${b.dimension.id}|${b.x}|${b.y}|${b.z}`;
function rastrearCoco(block) {
  const lista = listaRastreados();
  const chave = chaveDe(block);
  if (lista.has(chave)) return;
  lista.set(chave, world.getAbsoluteTime());
  rastreadosSujo = true;
  while (lista.size > MAX_COCOS_RASTREADOS) lista.delete(lista.keys().next().value); // descarta o mais antigo
}
world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  if (block.typeId === BLOCO) rastrearCoco(block);
});
system.runInterval(() => {
  const lista = listaRastreados();
  const agora = world.getAbsoluteTime();
  for (const [chave, desde] of [...lista]) {
    const [dimId, x, y, z] = chave.split("|");
    try {
      const block = world.getDimension(dimId).getBlock({ x: Number(x), y: Number(y), z: Number(z) });
      if (!block) continue; // chunk nao carregado: espera
      if (block.typeId !== BLOCO) {
        lista.delete(chave);
        rastreadosSujo = true;
      } else if (agora < Number(desde) || agora - Number(desde) >= SECAR_APOS_TICKS) {
        // (agora < desde: o tempo do mundo foi mudado para tras; seca mesmo assim)
        const n = block.permutation.getState(ESTADO);
        block.setPermutation(BlockPermutation.resolve(BLOCO_SECO, { [ESTADO]: typeof n === "number" ? n : 1 }));
        block.dimension.playSound("block.mud.place", block.center(), { pitch: 1.4, volume: 0.6 });
        lista.delete(chave);
        rastreadosSujo = true;
      }
    } catch {}
  }
  if (rastreadosSujo) {
    rastreadosSujo = false;
    world.setDynamicProperty(PROP_SECAR, JSON.stringify(Object.fromEntries(lista)));
  }
}, INTERVALO_SECAR_TICKS);

// ===== Pular em cima da bosta seca: ela vira mancha no chao =====
const noChaoAntes = new Map(); // player.id -> estava no chao no tick anterior
const PONTOS_PE = [[0, 0], [0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]];
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const agora = player.isOnGround;
    const antes = noChaoAntes.get(player.id) ?? agora;
    noChaoAntes.set(player.id, agora);
    if (antes || !agora) continue; // so no momento em que o pe encosta no chao
    const { x, y, z } = player.location;
    for (const [dx, dz] of PONTOS_PE) {
      try {
        const block = player.dimension.getBlock({ x: Math.floor(x + dx), y: Math.floor(y), z: Math.floor(z + dz) });
        if (block?.typeId !== BLOCO_SECO) continue;
        block.setPermutation(BlockPermutation.resolve(BLOCO_MANCHA, { [ESTADO_FACE]: 0 }));
        splash(player.dimension, block.center());
        break;
      } catch {}
    }
  }
}, 1);
world.afterEvents.playerLeave.subscribe(({ playerId }) => noChaoAntes.delete(playerId));

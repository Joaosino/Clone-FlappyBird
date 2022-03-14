const sprites = new Image();
sprites.src = './sprites.png'
let frames = 0
const canvas = document.querySelector('canvas')
const contexto = canvas.getContext('2d')

const somDeHit = new Audio()
somDeHit.src = './efeitos/hit.wav'

const somDeQueda = new Audio()
somDeQueda.src = './efeitos/caiu.wav'

const somDePonto = new Audio()
somDePonto.src = './efeitos/ponto.wav'

const somDePulo = new Audio()
somDePulo.src = './efeitos/pulo.wav'

function fazColisao(flappyBird, chao) {
  const flappyBirdY = flappyBird.y + flappyBird.altura
  const chaoY = chao.y

  if (flappyBirdY >= chaoY) {
    return true
  }
  return false
}

function criaFlappyBird() {
  const flappyBird = {
    spriteX: 0,
    spriteY: 0,
    largura: 33,
    altura: 24,
    x: 10,
    y: 50,
    gravidade: 0.25,
    velocidade: 0,
    pulo: 4.6,
    pula() {
      flappyBird.velocidade = -flappyBird.pulo
      somDePulo.play()
    },
    atualiza() {
      if (fazColisao(flappyBird, globais.chao)) {
        somDeHit.play()
        mudaParaTela(Telas.GAME_OVER)
        return
      }
      flappyBird.velocidade += flappyBird.gravidade
      flappyBird.y += flappyBird.velocidade
    },
    movimentos: [
      { spriteX: 0, spriteY: 0 }, // asa para cima
      { spriteX: 0, spriteY: 26 }, // asa no meio
      { spriteX: 0, spriteY: 52 }, // asa para baixo
      { spriteX: 0, spriteY: 26 } // asa no meio
    ],
    frameAtual: 0,
    atualizaFrameAtual() {
      const intervaloDeFrames = 10
      const passouOIntervalo = frames % intervaloDeFrames === 0
      if (passouOIntervalo) {
        const baseDoIncremento = 1
        const incremento = baseDoIncremento + flappyBird.frameAtual
        const baseRepetição = flappyBird.movimentos.length
        flappyBird.frameAtual = incremento % baseRepetição
      }
    },
    desenha() {
      flappyBird.atualizaFrameAtual()
      const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual]

      contexto.drawImage(
        sprites, //seleciona a imagem
        spriteX,
        spriteY, //indica o inicio do recorte
        flappyBird.largura,
        flappyBird.altura, //indica o fim do recorte da imagem
        flappyBird.x,
        flappyBird.y, //indica o inicio do desenho
        flappyBird.largura,
        flappyBird.altura //indica o tamanho do desenho
      )
    }
  }
  return flappyBird
}

function criaCanos() {
  const canos = {
    largura: 52,
    altura: 400,
    chao: {
      spriteX: 0,
      spriteY: 169
    },
    ceu: {
      spriteX: 52,
      spriteY: 169
    },
    espaco: 80,
    desenha() {
      canos.pares.forEach(function (par) {
        const yRandom = par.y
        const espacamentoEntreCanos = 100
        // Cano do Ceu
        const canoCeuX = par.x
        const canoCeuY = par.y
        contexto.drawImage(
          sprites,
          canos.ceu.spriteX,
          canos.ceu.spriteY,
          canos.largura,
          canos.altura,
          canoCeuX,
          canoCeuY,
          canos.largura,
          canos.altura
        )
        // Cano do Chão
        const canoChaoX = par.x
        const canoChaoY = canos.altura + espacamentoEntreCanos + yRandom
        contexto.drawImage(
          sprites,
          canos.chao.spriteX,
          canos.chao.spriteY,
          canos.largura,
          canos.altura,
          canoChaoX,
          canoChaoY,
          canos.largura,
          canos.altura
        )
        par.canoCeu = {
          x: canoCeuX,
          y: canos.altura + canoCeuY
        }
        par.canoChao = {
          x: canoChaoX,
          y: canoChaoY
        }
      })
    },
    temColisaoComFlappy(par) {
      const cabeçaDoFlappy = globais.flappyBird.y
      const peDoFlappy = globais.flappyBird.y + globais.flappyBird.altura
      if (globais.flappyBird.x + globais.flappyBird.largura - 2 >= par.x) {
        if (cabeçaDoFlappy <= par.canoCeu.y) {
          return true
        }
        if (peDoFlappy >= par.canoChao.y) {
          return true
        }
      }
      return false
    },
    pares: [],
    atualiza() {
      const passou100Frames = frames % 100 === 0
      if (passou100Frames) {
        canos.pares.push({
          x: canvas.width,
          y: -150 * (Math.random() + 1)
        })
      }
      canos.pares.forEach(function (par) {
        par.x -= 2
        if (canos.temColisaoComFlappy(par)) {
          somDeHit.play()
          mudaParaTela(Telas.GAME_OVER)
        }
        if (par.x + canos.largura <= 0) {
          canos.pares.shift()
        }
      })
    }
  }
  return canos
}

function criaPlacar(){
  const placar = {
    pontuacao: 0,
    desenha(){
      contexto.font = '35px "VT323"';
      contexto.textAlign = 'right';
      contexto.fillStyle = 'white';
      contexto.fillText(`Pontos ${placar.pontuacao}`, canvas.width - 50,35)
      placar.pontuacao
    },
    atualiza(){
      const intervaloDeFrames = 50
      const passouOIntervalo = frames % intervaloDeFrames === 0
      if(passouOIntervalo){
        placar.pontuacao = placar.pontuacao + 1
      }
      
    }
  }
  return placar;
}

function criaChao() {
  const chao = {
    spriteX: 0,
    spriteY: 610,
    largura: 224,
    altura: 112,
    x: 0,
    y: canvas.height - 112,
    atualiza() {
      const movimentaChao = 1
      const repeteEm = chao.largura / 8
      const movimentacao = chao.x - movimentaChao
      chao.x = movimentacao % repeteEm
    },
    desenha() {
      contexto.drawImage(
        sprites, //seleciona a imagem
        chao.spriteX,
        chao.spriteY, //indica o inicio do recorte
        chao.largura,
        chao.altura, //indica o fim do recorte da imagem
        chao.x,
        chao.y, //indica o inicio do desenho
        chao.largura,
        chao.altura //indica o tamanho do desenho
      )
      contexto.drawImage(
        sprites, //seleciona a imagem
        chao.spriteX,
        chao.spriteY, //indica o inicio do recorte
        chao.largura,
        chao.altura, //indica o fim do recorte da imagem
        chao.x + chao.largura,
        chao.y, //indica o inicio do desenho
        chao.largura,
        chao.altura //indica o tamanho do desenho
      )
    }
  }
  return chao
}

const planoDeFundo = {
  spriteX: 390,
  spriteY: 0,
  largura: 275,
  altura: 204,
  x: 0,
  y: canvas.height - 204,
  desenha() {
    contexto.fillStyle = '#70c5ce'
    contexto.fillRect(0, 0, canvas.width, canvas.height)
    contexto.drawImage(
      sprites, //seleciona a imagem
      planoDeFundo.spriteX,
      planoDeFundo.spriteY, //indica o inicio do recorte
      planoDeFundo.largura,
      planoDeFundo.altura, //indica o fim do recorte da imagem
      planoDeFundo.x,
      planoDeFundo.y, //indica o inicio do desenho
      planoDeFundo.largura,
      planoDeFundo.altura //indica o tamanho do desenho
    )

    contexto.drawImage(
      sprites, //seleciona a imagem
      planoDeFundo.spriteX,
      planoDeFundo.spriteY, //indica o inicio do recorte
      planoDeFundo.largura,
      planoDeFundo.altura, //indica o fim do recorte da imagem
      planoDeFundo.x + planoDeFundo.largura,
      planoDeFundo.y, //indica o inicio do desenho
      planoDeFundo.largura,
      planoDeFundo.altura //indica o tamanho do desenho
    )
  }
}

const mensagemGetReady = {
  spriteX: 134,
  spriteY: 0,
  largura: 174,
  altura: 152,
  x: canvas.width / 2 - 174 / 2,
  y: 50,
  desenha() {
    contexto.drawImage(
      sprites, //seleciona a imagem
      mensagemGetReady.spriteX,
      mensagemGetReady.spriteY, //indica o inicio do recorte
      mensagemGetReady.largura,
      mensagemGetReady.altura, //indica o fim do recorte da imagem
      mensagemGetReady.x,
      mensagemGetReady.y, //indica o inicio do desenho
      mensagemGetReady.largura,
      mensagemGetReady.altura //indica o tamanho do desenho
    )
  }
}

const mensagemGameOver = {
  spriteX: 134,
  spriteY: 153,
  largura: 226,
  altura: 200,
  x: canvas.width / 2 - 226 / 2,
  y: 50,
  desenha() {
    contexto.drawImage(
      sprites, //seleciona a imagem
      mensagemGameOver.spriteX,
      mensagemGameOver.spriteY, //indica o inicio do recorte
      mensagemGameOver.largura,
      mensagemGameOver.altura, //indica o fim do recorte da imagem
      mensagemGameOver.x,
      mensagemGameOver.y, //indica o inicio do desenho
      mensagemGameOver.largura,
      mensagemGameOver.altura //indica o tamanho do desenho
    )
  }
}
//
// TELAS
//
const globais = {}
let telaAtiva = {}
function mudaParaTela(novaTela) {
  telaAtiva = novaTela

  if (telaAtiva.inicializar) {
    telaAtiva.inicializar()
  }
}

const Telas = {
  INICIO: {
    inicializar() {
      globais.flappyBird = criaFlappyBird()
      globais.chao = criaChao()
      globais.canos = criaCanos()
    },
    desenha() {
      planoDeFundo.desenha()
      globais.chao.desenha()
      globais.flappyBird.desenha()
      mensagemGetReady.desenha()
    },
    click() {
      mudaParaTela(Telas.JOGO)
    },
    atualiza() {
      globais.chao.atualiza()
    }
  },
  JOGO: {
    inicializar() {
      globais.placar = criaPlacar()
    },
    desenha() {
      planoDeFundo.desenha()
      globais.canos.desenha()
      globais.chao.desenha()
      globais.flappyBird.desenha()
      globais.placar.desenha()
    },
    click() {
      globais.flappyBird.pula()
    },
    atualiza() {
      globais.flappyBird.atualiza()
      globais.chao.atualiza()
      globais.canos.atualiza()
      globais.placar.atualiza()
    }
  },
  GAME_OVER: {
    desenha(){
      mensagemGameOver.desenha()
    },
    atualiza(){

    },
    click(){
      mudaParaTela(Telas.INICIO)
    }
    
  }
}

function loop() {
  telaAtiva.desenha()
  telaAtiva.atualiza()
  requestAnimationFrame(loop)
  frames += 1
}
window.addEventListener('click', function () {
  if (telaAtiva.click) {
    telaAtiva.click()
  }
})

mudaParaTela(Telas.INICIO)
loop()

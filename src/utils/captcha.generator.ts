import { CanvasRenderingContext2D, createCanvas } from "canvas";

// Função para gerar uma string aleatória
function generateRandomText(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Interface para o retorno da função
interface CaptchaResult {
    image: Buffer;
    text: string;
}

// Função para gerar a imagem de CAPTCHA
function generateCaptcha(): CaptchaResult {
    const width: number = 280;
    const height: number = 54;
    const canvas = createCanvas(width, height);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    // Preenche o fundo com uma cor clara
    ctx.fillStyle = "#5c5c5c";
    ctx.fillRect(0, 0, width, height);

    // Adiciona ruído ao fundo
    for (let i = 0; i < 10000; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Gera o texto do CAPTCHA
    const captchaText: string = generateRandomText(6); // 6 caracteres
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "rgb(29, 29, 29)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Adiciona o texto com leve distorção
    for (let i = 0; i < captchaText.length; i++) {
        ctx.save();
        ctx.translate(20 + i * 40, height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.4); // Rotação aleatória
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }

    // Adiciona linhas aleatórias
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, 1)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // Gera o buffer da imagem
    const buffer: Buffer = canvas.toBuffer("image/png");

    // Retorna o buffer da imagem e o texto do CAPTCHA
    return {
        image: buffer,
        text: captchaText.toLowerCase(),
    };
}

export default generateCaptcha;
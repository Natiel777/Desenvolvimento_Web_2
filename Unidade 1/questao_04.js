class Livro {
    constructor(titulo, autor, ano){
        this.titulo = titulo;
        this.autor = autor;
        this.ano = ano;
    }

    detalhes() {
        console.log(`Livro: ${this.titulo} | Autor: ${this.autor} | Ano: ${this.ano}`)
    }
}

const livro1 = new Livro("Harry Potter", "J.K. Rowling", 1997);
const livro2 = new Livro("O Príncipe", "Nicolau Maquiavel", 1532);

livro1.detalhes();
livro2.detalhes();

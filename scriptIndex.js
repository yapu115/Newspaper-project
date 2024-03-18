// Creacion de varios articulos
const container = document.querySelector(".posts")


function createHeader(title, subtitle, image,){
    const header = document.createElement("HEADER");
    header.classList.add("heading");
    
    const imgLogo = document.createElement("IMG");
    imgLogo.classList.add("logo-head")
    imgLogo.setAttribute("src", "img/bugle_logo.jpg")
    imgLogo.setAttribute("width", "500")
    imgLogo.setAttribute("alt", "Bugle image")

    const h2 = document.createElement("H2");
    h2.classList.add("title")
    
    const p = document.createElement("P");
    p.classList.add("subtitle")
    
    const imgPost = document.createElement("IMG");
    imgPost.classList.add("post-photo")
    imgPost.setAttribute("src", image)
    imgPost.setAttribute("width", "300")
    imgPost.setAttribute("alt", "article image")

    header.appendChild(imgLogo);
    header.appendChild(h2);
    header.appendChild(p);
    header.appendChild(imgPost);


    const textTitle = document.createTextNode(title)
    const textSubtitle = document.createTextNode(subtitle)

    h2.appendChild(textTitle)
    p.appendChild(textSubtitle)

    return header
}


function createSection(date, author, bodyText){
    const section = document.createElement("SECTION");
    section.classList.add("post-content");
    
    const divWritter = document.createElement("DIV");
    divWritter.classList.add("post-writter");

    const divDate = document.createElement("DIV");
    divDate.classList.add("post-date")
    
    const pWritter = document.createElement("P");
    const textWritter = document.createTextNode(`Written by: ${author}`)
    pWritter.appendChild(textWritter)
    
    const pDate = document.createElement("P");
    const textDate = document.createTextNode(date)
    pDate.appendChild(textDate)
    
    divDate.appendChild(pDate)
    divWritter.appendChild(divDate)
    divWritter.appendChild(pWritter)
    
    section.appendChild(divWritter)
    
    const divBody = document.createElement("DIV");

    for (let i = 0; i < 5; i++) {
        const divParagraph = document.createElement("DIV")
        const pParagraph = document.createElement("P")
        const textParagraph = document.createTextNode(bodyText)
        pParagraph.appendChild(textParagraph)
        divParagraph.appendChild(pParagraph)
        
        divBody.appendChild(divParagraph)
    }
    section.appendChild(divBody)

    return section;
}


function createArticle(title, subtitle, image, date, author, bodyText, hashtags){
    const article = document.createElement("ARTICLE"); // "Crea el elemento"
    article.classList.add("post");

    const header = createHeader(title, subtitle, image)
    article.appendChild(header);

    const section = createSection(date, author, bodyText)
    article.appendChild(section);
    
    return article
}


let documentFragment = document.createDocumentFragment();

for (i=5; i < 11; i++){
    let article = createArticle(`Article No: ${i}`, `Subtitle: ${i}`, "img/report_images/miss_stacy.jpg", `March: ${i}`, "Ned leeds", "This is a test text", "a")
    
    documentFragment.appendChild(article)
}
container.appendChild(documentFragment)








function stringToBoolConvertion(string) {
    let boolStatus
    if (string == "true") boolStatus = true
    else boolStatus = false
    return boolStatus
}

let loggedIn = stringToBoolConvertion(localStorage.getItem("loggedIn"))

if (loggedIn){
    let createArticleBtn = createNewArticleButton()
    
    const modalBackground = document.getElementById("modal-background");
    const newArticleModal = document.getElementById("new-article-modal");
    
    createArticleBtn.addEventListener("click", function() {
        createNewArticle(modalBackground, newArticleModal)
    })

    // Opcional: Agregar un listener para cerrar el modal cuando se hace clic fuera de él
    modalBackground.addEventListener("click", function() {
        modalBackground.style.display = "none";
        newArticleModal.style.display = "none";
    });

}


function createNewArticleButton() {
    let createArticleBtn = document.createElement("button")
    let createArticleDiv = document.getElementById("new-article-button-div")
    createArticleBtn.setAttribute("id", "create-article-button")
    createArticleBtn.setAttribute("type", "button")

    createArticleDiv.appendChild(createArticleBtn) 
    const botonText = document.createTextNode(`New Article`)
    createArticleBtn.appendChild(botonText)

    return createArticleBtn


}

function createNewArticle(modalBackground, newArticleModal) {
    modalBackground.style.display = "block";
    newArticleModal.style.display = "block";
        
}


console.log(localStorage.getItem("loggedIn"))










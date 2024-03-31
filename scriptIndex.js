"use strict"

// Variables
const container = document.querySelector(".posts")
let documentFragment = document.createDocumentFragment();
let userInfo = JSON.parse(localStorage.getItem("userInfo"))
const date = new Date()

// New articles creation
function createHeader(title, subtitle, image){
    console.log(image)
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


function createSection(date,bodyText){
    let author = `${userInfo.name} ${userInfo.last_name}`

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

    const divParagraph = document.createElement("DIV")
    const pParagraph = document.createElement("P")
    const textParagraph = document.createTextNode(bodyText)
    pParagraph.appendChild(textParagraph)
    divParagraph.appendChild(pParagraph)
    
    divBody.appendChild(divParagraph)

    section.appendChild(divBody)

    return section;
}


function createArticle(title, subtitle, image, date, bodyText, hashtags){
    const article = document.createElement("ARTICLE"); 
    article.classList.add("post");

    const header = createHeader(title, subtitle, image)
    article.appendChild(header);

    const section = createSection(date, bodyText)
    article.appendChild(section);
    
    return article
}









function stringToBoolConvertion(string) {
    let boolStatus
    if (string == "true") boolStatus = true
    else boolStatus = false
    return boolStatus
}


// If the user is logged
let loggedIn = stringToBoolConvertion(localStorage.getItem("loggedIn"))
if (loggedIn){
    let createArticleBtn = createNewArticleButton()
    
    const modalBackground = document.getElementById("modal-background");
    const newArticleModal = document.getElementById("new-article-modal");
    
    // New article form
    createArticleBtn.addEventListener("click", function() {
        showNewArticleContainer(modalBackground, newArticleModal)
    })
    
    modalBackground.addEventListener("click", function() {
        modalBackground.style.display = "none";
        newArticleModal.style.display = "none";
    });
    
    
    const newArtImgFile = document.getElementById("new-article-img-file");
    const newArtImage = document.getElementById("new-article-img");
    const increaseImgWidth = document.getElementById("increase-img-width")
    const reduceImgWidth = document.getElementById("reduce-img-width")
    let urlImg
    
    newArtImgFile.addEventListener("change", function(event) {
        let file = event.target.files[0];
        
        if (file) {
            let reader = new FileReader();
            reader.onload = function(event) {
                urlImg = event.target.result;
                
                const img = document.createElement("img");
                img.src = urlImg;
                img.width = 300;
                
                newArtImage.innerHTML = "";
                newArtImage.appendChild(img);
                
                increaseImgWidth.style.display = "inline-block";
                reduceImgWidth.style.display = "inline-block";
                
                increaseImgWidth.addEventListener("click", function(){
                    if (img.width < 400) img.width += 50
                    console.log(img.width)
                })
                
                reduceImgWidth.addEventListener("click", function(){
                    if (img.width > 200) img.width -= 50
                    console.log(img.width)
                })
            };
            reader.readAsDataURL(file);
        }
    });
    
    const publishNewArticleBtn = document.getElementById("publish-new-article-btn")
    publishNewArticleBtn.addEventListener("click", () => {
        
        const title = document.getElementById("new-article-title").value;
        const subtitle = document.getElementById("new-article-subtitle").value;
        const img = document.getElementById("new-article-img-file").files[0];
        const date = document.getElementById("new-article-date").value;
        const bodyText = document.getElementById("new-article-body").value;
        const hashtags = document.getElementById("new-article-hashtags").value;
        
        let newArticle = createArticle(title, subtitle, img, date, bodyText, hashtags)
        
        let documentFrad = document.createDocumentFragment()
        documentFrad.appendChild(newArticle)
        container.appendChild(documentFrad)
        modalBackground.style.display = "none";
        newArticleModal.style.display = "none";
    } )
}

// New articles creation
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

function showNewArticleContainer(modalBackground, newArticleModal) {
    modalBackground.style.display = "block";
    newArticleModal.style.display = "block";    

    let newArticleTitle = document.getElementById("new-article-title");
    let newArticleSubtitle = document.getElementById("new-article-subtitle");
    let newArticleBody = document.getElementById("new-article-body");

    newArticleTitle.value = "";
    newArticleSubtitle.value = "";
    newArticleBody.value = "";

    applyTextAreaStyle(newArticleTitle)
    applyTextAreaStyle(newArticleSubtitle)

    document.getElementById("new-article-date").innerHTML = `${getCompleteDate()}`
}


// Image reader
function readImage(imageFile){
    let file = imageFile.target.files[0];
        
    if (file) {
        let reader = new FileReader();
        reader.onload = function(imageFile) {
            let urlImg = imageFile.target.result;
            
            const img = document.createElement("img");
            img.src = urlImg;
            img.width = 300
            

        };
        reader.readAsDataURL(file);
    }
}



const applyTextAreaStyle = (textarea)=> {
    textarea.addEventListener("input",function(){
        if (this.value.length > 31){
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px';
        }
    })
}

const getCompleteDate = ()=> {
    let suffix;
    let day = date.getDate()

    if (day === 1 || day === 21 || day === 31){
        suffix = "st"
    }
    else if (day === 2 || day === 22){
        suffix = "nd"
    }
    else if (date === 3 || day === 23){
        suffix = "rd"
    }
    else {
        suffix = "th"
    }

    const completeDate = `${date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric', 
    }) + suffix} ${date.getFullYear()}`; 
    
    return completeDate
}




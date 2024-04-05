"use strict"

// Variables
const postsContainer = document.querySelector(".posts")
let documentFragment = document.createDocumentFragment();
let userInfo = JSON.parse(localStorage.getItem("userInfo"))
const date = new Date()

// IndexedDatabase
const DBRequestArticles = indexedDB.open("ArticlesDB",1);

// Open DB
DBRequestArticles.addEventListener("upgradeneeded", ()=> {
    const db = DBRequestArticles.result;
    const store = db.createObjectStore("articles", {
        keyPath: "id",
        autoIncrement: true
    })

    store.createIndex("likesCount", "likes", { unique: false } )
    store.createIndex("commentsCount", "comments", { unique: false })
})

// Succesfull DB open
DBRequestArticles.onsuccess = () => {
    const db = DBRequestArticles.result;

    function getIDBData(mode){
        const transaction = db.transaction("articles", mode)
        const objectStore = transaction.objectStore("articles")
        return objectStore
    }
    
    function saveArticle(article){
        // const transaction = db.transaction("articles", "readwrite");    
        // const objectStore = transaction.objectStore("articles")
        const objectStore = getIDBData("readwrite")
        
        const request = objectStore.add(article)
        request.onsuccess = ()=> {
            console.log("Article saved")
        }
        request.onerror = ()=> {
            console.log("There has been an error")
        }
    }

    function getArticles(){
        return new Promise((resolve, reject) => {
            // const transaction = db.transaction("articles", "readonly");
            // const objectStore = transaction.objectStore("articles");
            const objectStore = getIDBData("readonly")
    
            const request = objectStore.getAll();
            request.onsuccess = ()=> {
                const articles = request.result
                resolve(articles)
            }    
            request.onerror = ()=> {
                reject(new Error("Error obtaining the articles"))
            }
        })
    }

    function getArticleById(id){
        return new Promise((resolve, reject) =>{
            let objectStore = getIDBData("readonly")
            const request = objectStore.get(parseInt(id))
            request.onsuccess = ()=> {
                const article = request.result;
                resolve(article)
            }
            request.onerror = ()=>{
                reject(new Error("The ID doesnt match with any article"))
            }
        })
    }

    function updateArticleLikes(article, newLikes){
        return new Promise((resolve, reject) =>{
            let objectStore = getIDBData("readwrite")
            article.likes = newLikes;
            const request = objectStore.put(article)
            request.onsuccess = ()=> {
                resolve(request.result)
            }
            request.onerror = ()=>{
                reject(new Error("There was an error updating the article likes"))
            }
        })
    }

    // Load articles on the page
    getArticles().then((articles) =>{
        for (let articleData of articles){
            const id = articleData.id;
            const title = articleData.title;
            const subtitle = articleData.subtitle;
            const img = articleData.img;
            const date = articleData.date;
            const author = articleData.author;
            const body = articleData.bodyText;
            const likes = articleData.likes;
            const comments = articleData.comments;
            
            const article = createArticle(id, title, subtitle, img, date, author, body, "a", likes, comments)
            
            documentFragment.appendChild(article)
        }
        postsContainer.appendChild(documentFragment)
        


        //////////////////////////////////////////////////////////////

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
            

            // Select an image
            newArtImgFile.addEventListener("change", function(event) {
                let file = event.target.files[0];
                
                if (file) {
                    let reader = new FileReader();
                    reader.onload = function(event) {
                        let urlImg = event.target.result;
                        
                        const img = document.createElement("img");
                        img.src = urlImg;
                        img.width = 300;
                        
                        newArtImage.innerHTML = "";
                        newArtImage.appendChild(img);
                        
                        increaseImgWidth.style.display = "inline-block";
                        reduceImgWidth.style.display = "inline-block";
                        
                        increaseImgWidth.addEventListener("click", function(){
                            if (img.width < 400) img.width += 50
                            console.log(img.width);
                        })
                        
                        reduceImgWidth.addEventListener("click", function(){
                            if (img.width > 200) img.width -= 50
                            console.log(img.width);
                        })
                    };
                    reader.readAsDataURL(file);
                }
            });

            
            // Publish new article 
            const publishNewArticleBtn = document.getElementById("publish-new-article-btn")
            publishNewArticleBtn.addEventListener("click", () => {
                
                const title = document.getElementById("new-article-title").value;
                const subtitle = document.getElementById("new-article-subtitle").value;
                const img = document.getElementById("new-article-img-file").files[0];
                const date = document.getElementById("new-article-date").innerHTML;
                const author = `${userInfo.name} ${userInfo.last_name}`
                const bodyText = document.getElementById("new-article-body").value;
                const hashtags = document.getElementById("new-article-hashtags").value;
                
                const newArticleJSON = {
                    title: title,
                    subtitle: subtitle,
                    img: img,
                    date: date,
                    author: author,
                    bodyText: bodyText,
                    likes: 0,
                    comments: 0,
                }
                
                saveArticle(newArticleJSON)
                location.reload();
                modalBackground.style.display = "none";
                newArticleModal.style.display = "none";
            } )


            const likeButtons = document.querySelectorAll(".like-button")
            for (let button of likeButtons){
                
                button.addEventListener("click", ()=> {
                    const likeCount = button.nextElementSibling;
                    let currentLikes = parseInt(likeCount.textContent);
                    let buttonPostID = getParentElement(button, 4).id;

                    let clickedState = localStorage.getItem(`clickedStateButton${buttonPostID}${userInfo.username}`);
                    let clicked;
                    if (clickedState)
                        clicked = stringToBoolConvertion(clickedState);
                    else
                        clicked = false;
                    
                    getArticleById(buttonPostID).then((buttonArticle) =>{
                        if (!clicked) {
                            button.innerHTML = `<i class="fa-solid fa-heart"></i>`;
                            currentLikes ++;
                            clicked = true;
                        }
                        else {
                            button.innerHTML = `<i class="fa-regular fa-heart"></i>`;
                            currentLikes --;
                            clicked = false;
                        }
                        likeCount.textContent = currentLikes;
                        updateArticleLikes(buttonArticle, currentLikes).then(smt => {
                            console.log("Succesfull like update") 
                            localStorage.setItem(`clickedStateButton${buttonPostID}${userInfo.username}`, clicked)
                        })
                        
                    }).catch(e =>{
                        console.log(e)
                    })

                })
            }
        }  
    }).catch(e=>{
        console.log(e)
    })

    // DB modification
    function updateLikes(){
        const transaction = db.transaction("articles", "readonly");
        const objectStore = transaction.objectStore("articles");  

        const reques = objectStore.put()
    } 
}





// Articles creation
function createHeader(title, subtitle, image){
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
    readFileImage(image).then(imgUrl => {
        imgPost.setAttribute("src", imgUrl)
    }).catch(error =>{
        console.log(error.message);
    })
    // imgPost.setAttribute("src", image)
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
    const articleAuthor = author; 

    const section = document.createElement("SECTION");
    section.classList.add("post-content");
    
    const divWritter = document.createElement("DIV");
    divWritter.classList.add("post-writter");

    const divDate = document.createElement("DIV");
    divDate.classList.add("post-date")
    
    const pWritter = document.createElement("P");
    const textWritter = document.createTextNode(`Written by: ${articleAuthor}`)
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

function createFooter(id, topics, likes, comments){
    const footer = document.createElement("footer");
    footer.classList.add("article-footer");

    const divTopics = document.createElement("div")
    divTopics.classList.add("article-topics")

    const pTopics = document.createElement("p");
    const textTopics = document.createTextNode(topics)

    pTopics.appendChild(textTopics)
    divTopics.appendChild(pTopics);


    const divButtonContainer = document.createElement("div");
    divButtonContainer.classList.add("buttons-container")
    
    for (let i = 0; i < 2; i++) {
        let buttonType;
        let iclassIconType;
        let iclassIcon;
        let count;
        if (i == 0){
            buttonType = "like"
            if (stringToBoolConvertion(localStorage.getItem(`clickedStateButton${id}${userInfo.username}`)))  
                iclassIconType = "fa-solid"
            else
                iclassIconType = "fa-regular"
        

            iclassIcon = "fa-heart"
            count = likes;
        }
        else{
            buttonType = "comment"
            iclassIconType = "fa-solid"
            iclassIcon = "fa-comment"
            count = comments;
        }

        const divButtonWrapper = document.createElement("div");
        divButtonWrapper.classList.add("button-wrapper");
        
        const button = document.createElement("button");
        button.classList.add(`${buttonType}-button`)
        button.setAttribute("type", "button");

        const iButton = document.createElement("i");
        iButton.classList.add(iclassIconType)
        iButton.classList.add(iclassIcon)

        const pCount = document.createElement("p")
        pCount.classList.add(`${buttonType}-count`)
        const textCount = document.createTextNode(count)
        
        pCount.appendChild(textCount)
        button.appendChild(iButton)
        divButtonWrapper.append(button)
        divButtonWrapper.append(pCount)
        divButtonContainer.appendChild(divButtonWrapper)
    }

    // const formCommentSection = document.createElement("form");
    
    // const textAreaCommentSection = document.createElement("textarea");
    // const buttonCommentSection = document.createElement("button")


    // formCommentSection.appendChild(textAreaCommentSection);
    // formCommentSection.appendChild(buttonCommentSection);


    
    footer.appendChild(divTopics);
    footer.appendChild(divButtonContainer);
    // footer.appendChild(formCommentSection)

    return footer;
}

function createArticle(id, title, subtitle, image, date, author, bodyText, topics, likes, comments){
    const article = document.createElement("article"); 
    article.classList.add("post");
    article.id = id;

    const header = createHeader(title, subtitle, image)
    article.appendChild(header);

    const section = createSection(date, author, bodyText)
    article.appendChild(section);

    const footer = createFooter(id, topics, likes, comments)
    article.appendChild(footer)

    return article
}











// New articles creation documents/ implementation
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

// Usefull functions
////////////////////////////////////////////////////////

// convertion
function stringToBoolConvertion(string) {
    let boolStatus
    if (string == "true") boolStatus = true
    else boolStatus = false
    return boolStatus
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

// Image File reader
const readFileImage = (file) => {
    if (file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")){
                reject(new Error("The file is not an image"))
                return;
            }

            const reader = new FileReader();
    
            reader.onload = function(event) {
                const imageUrl = event.target.result;
                resolve(imageUrl)
            };
            
            reader.onerror = ()=> {
                reject(new Error("Error reading the  file"));
            }
            reader.readAsDataURL(file);
        })
    }
}


// Text area styles
const applyTextAreaStyle = (textarea)=> {
    textarea.addEventListener("input",function(){
        if (this.value.length > 31){
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px';
        }
    })
}


// Date format
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


const getParentElement = (element, timesFather) =>{
    for (let i = 0; i < timesFather; i++) {
        element = element.parentNode;
    }
    return element;
}
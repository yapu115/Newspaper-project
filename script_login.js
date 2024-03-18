let loggedIn


const getInfo = async ()=>{
    let request = await fetch("staff_info.txt")
    return await request.json()   
}

function checkLogin(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    getInfo().then(usersInfo => {
        for (let userInfo in usersInfo){
            
            let user = usersInfo[userInfo].username;
            let userPassword = usersInfo[userInfo].password;

            let allUserInfo = usersInfo[userInfo]
            
            if (user == username && password == userPassword){
                loggedIn = true
                localStorage.setItem("userInfo", JSON.stringify(allUserInfo));
                localStorage.setItem("loggedIn", loggedIn);
                welcomeUser(allUserInfo)
            }
            else if (user === username && password != userPassword){
                let errorMessageP = document.createElement("p");
                let errorMessageDiv = document.getElementById("form-password");
                
                errorMessageP.setAttribute("id", "error-message");
                errorMessageDiv.appendChild(errorMessageP);
                
                const errorText = document.createTextNode(`Wrong password`);
                errorMessageP.appendChild(errorText);
            }            
        }
    })    
}
document.getElementById('login-button').addEventListener("click", checkLogin);

console.log(localStorage.getItem("loggedIn"));



function stringToBoolConvertion(string) {
    let boolStatus
    if (string == "true") boolStatus = true
    else boolStatus = false
    return boolStatus
}

loggedIn = stringToBoolConvertion(localStorage.getItem("loggedIn"))
if (loggedIn){
    let userInfo = JSON.parse(localStorage.getItem("userInfo"))
    welcomeUser(userInfo)
}


function welcomeUser(userInfo){

    const loginContainer = document.querySelector(".login-container");
    loginContainer.style.display = "none"
    
    let welcomeDiv = document.createElement("div");
    welcomeDiv.setAttribute("id", "welcome-container")

    let userForm = document.getElementById("user-form");
    userForm.appendChild(welcomeDiv); 

    let userPicture = document.createElement("img");
    userPicture.setAttribute("src", userInfo.picture)
    userPicture.setAttribute("id", "user-picture")

    const welcomeText = document.createTextNode(`Welcome back ${userInfo.name}!`)
    const welcomeP = document.createElement("p")
    welcomeP.appendChild(welcomeText)
    welcomeP.setAttribute("id", "welcome-text")

    const logOutBtn = document.createElement("button")
    const botonText = document.createTextNode(`Log out`)
    logOutBtn.appendChild(botonText)
    
    
    
    welcomeDiv.appendChild(welcomeP)
    welcomeDiv.appendChild(userPicture)
    welcomeDiv.appendChild(logOutBtn)
    
    
    logOutBtn.addEventListener("click", function() {
        loginContainer.style.display = "block";
        welcomeDiv.style.display = "none";
        loggedIn = false;
        localStorage.setItem("loggedIn", loggedIn)
    })
}














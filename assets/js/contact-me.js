function submitData() {
    let name = document.getElementById("input-name").value
    let email = document.getElementById("input-email").value
    let phone = document.getElementById("input-phone").value
    let subject = document.getElementById("input-subject").value
    let message = document.getElementById("input-message").value
   
    if(name == ""){
        return alert("Name can not be empty");
    }
    else if (email == "" ) {
        return alert("Email can not be empty");
    }
    else if(phone == "") {
        return alert("Phone number can not be empty");
    }
    else if(subject == "") {
        return alert("You haven't select a Subject");
    }
    else if(message == "") {
        return alert("Please, leave your message");
    }
    
//alamat email yang dituju
let emailReceiver = "msusmana@gmail.com"

//Buat element html anchor
let a = document.createElement('a')
a.href = `mailto:${emailReceiver}?subject=${subject}&body=Hello my name is ${name},  ${message}. You can contact me at ${phone}`
console.log(a);
a.click()

//`mailto:${emailReceiver}?subject=${subject}&body=Hello my name is ${name},  ${message}. You can contact me at ${phone}`
//fungsi mail to untuk membuka aplikasi email
//.click adalah method js untuk mengklik otomatis

}


//Tampung data object ke array sehingga menjadi array of object
  let dataProject = [];

  //Fungsi
function addProject(event) {
  event.preventDefault(); //method agar tidak terefresh (jika terefresh inputan datanya akan hilang)
  
  //Pengambilan data dari file html menggunakan DOM
  let tittle = document.getElementById("input-project-tittle").value
  let description = document.getElementById("input-project-description").value
  let image = document.getElementById("input-project-image").files
  let startDate = new Date(document.getElementById("input-start-date").value)
  let endDate = new Date(document.getElementById("input-end-date").value)
  let monthInMilisecond = 2678400000 ; //asumsi 31 hari
  let distance = Math.floor((endDate - startDate) / monthInMilisecond);


  //men-convert gambar menjadi URL agar bisa diakses
  image = URL.createObjectURL(image[0])
  // console.log(tittle);
  // console.log(description);
  // console.log(image);

  //pengambilan data dari file HTML menggunakan DOM
  let javascript = document.getElementById("js").checked
  let nodejs = document.getElementById("nodejs").checked
  let reactjs = document.getElementById("reactjs").checked
  let vuejs = document.getElementById("vuejs").checked

  //pengondisian pengambilan icon technologies
  if (javascript) {
      javascript = document.getElementById("js").value;
  }
  else {
    javascript = "";
  }

  if (nodejs) {
    nodejs = document.getElementById("nodejs").value;
  }
  else {
    nodejs = "";
  }

  if (reactjs) {
    reactjs = document.getElementById("reactjs").value;
  }
  else {
    reactjs = "";
  }

  if (vuejs) {
    vuejs = document.getElementById("vuejs").value;
  }
  else {
    vuejs = "";
  }

  // console.log(javascript);
  // console.log(nodejs);
  // console.log(reactjs);
  // console.log(vuejs);

// Tampung data yang sudah diambil dari HTML ke dalam object
  let project = {
    tittle,
    description,
    distance,
    image,
    javascript,
    nodejs,
    reactjs,
    vuejs
  }
  // console.log(project);

  dataProject.push(project) //Memasukkan data object ke dalam array
  console.log(dataProject);

  toProjectList() //pemanggilan fungi toPrejectLis untuk merender blog. posisinya ada di dalam fungsi addProject()

}

//fungsi me-render project ke list project
function toProjectList() {
  document.getElementById("box-container-list-project-id").innerHTML = "" 

  for (let i = 0; i < dataProject.length; i++) {
    console.log(dataProject[i]); 

    document.getElementById("box-container-list-project-id").innerHTML += 
    `
      <div class="container-list-project">
          <div class="container-list-project-info">
              <a id="image-list-project" href="blog-detail.html"><img src="${dataProject[i].image}" /></a>
              <h3 id="tittle-list-project"> ${dataProject[i].tittle} </h3>
              <h5>durasi : ${dataProject[i].distance} bulan</h5>
              <p id="content-list-project"> ${dataProject[i].description} </p>
          </div>
          <div class="icon-tech-list-project">
              <i class="fa-brands fa-${dataProject[i].javascript} fa-xl"></i>
              <i class="fa-brands fa-${dataProject[i].nodejs} fa-xl"></i>
              <i class="fa-brands fa-${dataProject[i].reactjs} fa-xl"></i>
              <i class="fa-brands fa-${dataProject[i].vuejs} fa-xl"></i>
            </div>
            <div class="button-list-project">
              <button>edit</button>
              <button>delete</button>
          </div>
      </div>  
    `
  }

}


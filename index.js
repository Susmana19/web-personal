const express = require('express');
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash');
const { response } = require('express');

const db = require('./connection/db')
const upload = require('./middleware/fileUpload')

const app = express();
const port = 9000;

app.set('view engine', 'hbs'); // set view engine hbs
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/uploads', express.static(__dirname + '/uploads')); //Path URL utk akses folder assets
app.use(express.urlencoded({extended: false})); // utk menampilkan data ke dalam console, kalau tidak ada ini akan undefined. true utk tampilan nested(spesifik), false utk tampilan data umumnya

app.use(flash())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 2 * 60 * 60 * 1000 // 2 jam
    }
}))

//Method Get utk menampilkan halaman home

app.get('/', function(request, response){

    // console.log(request.session);
    
    //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
        if (err) throw err //Menampilkan error koneksi database

        let author_id = request.session.user ? request.session.user.id : ''

        const queryFilter = `SELECT tb_projects.id, tb_projects."name" as title, 
        tb_projects.start_date, tb_projects.end_date, tb_projects.description, 
        tb_projects.technologies, tb_projects.image, tb_users."name" FROM tb_projects 
        LEFT JOIN tb_users ON tb_projects.user_id = tb_users.id 
        WHERE user_id=${author_id}
        ORDER BY id DESC`

        const query = `SELECT tb_projects.id, tb_projects."name" as title, 
        tb_projects.start_date, tb_projects.end_date, tb_projects.description, 
        tb_projects.technologies, tb_projects.image, tb_users."name" FROM tb_projects 
        LEFT JOIN tb_users ON tb_projects.user_id = tb_users.id ORDER BY id DESC`

        const filterData = request.session.user ? queryFilter : query

        client.query(filterData, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            // console.table(result.rows);
            let data = result.rows

            let dataProject = data.map(function(item){
                return {
                    ...item,
                    distance: Math.floor((new Date(item.end_date) - new Date(item.start_date)) / 2678400000 ), // asumsi milisecond per 31 hari
                    isLogin: request.session.isLogin,
                    user: request.session.user,

                }
            })
                // console.log(dataProject);
                // console.log(request.session);
                // let filterProject
                // if(request.session.user){
                //     filterProject = dataProject.filter(function(item){
                //         return item.user_id === request.session.user.id
                //     })
                //     console.log(request.session.user);
                //     console.log(filterProject);
                // }

                // let resultProject = request.session.user ? filterProject : dataProject


            response.render('index', {dataProject, user: request.session.user, isLogin: request.session.isLogin});
        })

    })


});

//Method Get utk menampilkan halaman add-project
app.get('/add-project', function(request, response){

    if(!request.session.user){
        request.flash('not-login', '*Anda belum login, silahkan login terlebih dahulu')
        return response.redirect('/login')
    }



    response.render('add-project');
});

//Method Get utk menampilkan halaman contact-me
app.get('/contact-me', function(request, response){

    response.render('contact-me');
});

//Method Get utk menampilkan halaman project-detail
app.get('/project-detail/:id', function(request, response){
    if(!request.session.user){
    request.flash('not-login', '*Anda belum login, silahkan login terlebih dahulu')
    return response.redirect('/login')
    }


    let id = request.params.id
    // console.log(id);

    //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
        if (err) throw err //Menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            
            let data = result.rows
            // console.log(data);

            let dataProject = data.map(function(item) {
                return {
                    ...item,
                    distance: Math.floor((new Date(item.end_date) - new Date(item.start_date)) / 2678400000 ), // asumsi milisecond per 31 hari
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date)
                }
            })
            
            response.render('project-detail', { data: dataProject[0] });
        })
    })
});

//Method Post untuk menangkap/mengambil data di form add-project
app.post('/add-project', upload.single('inputImage'), function(request, response){
    
    // let { inputProjectTittle: name, inputStartDate: start_date, inputEndDate: end_date, projectDescription: description , inputImage: image } = request.body; // destructuring variabel penangkap/pengambil data
    let tangkap = request.body;

    //penampung isi inputan tiap data ((1))
    let name = tangkap.inputProjectTittle;
    let description = tangkap.projectDescription;
    let start_date = tangkap.inputStartDate;
    let end_date = tangkap.inputEndDate;
    let distance = Math.floor((new Date(end_date) - new Date(start_date)) / 2678400000 ); // asumsi milisecond per 31 hari
    let javascript = tangkap.js;
    let nodeJs = tangkap.nodejs;
    let reactJs = tangkap.reactjs;
    let vueJs = tangkap.vuejs;

    //variabel penampung image
    const image = request.file.filename

   //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
    if (err) throw err //Menampilkan error koneksi database

    const userId = request.session.user.id;

    let query = `INSERT INTO public.tb_projects (name, start_date, end_date, description, technologies, image, user_id)
                VALUES ('${name}', '${start_date}', '${end_date}', '${description}', '{"${javascript}","${nodeJs}","${reactJs}","${vueJs}"}', '${image}', '${userId}')`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            response.redirect('/');
            
            let data = result.rows

            let dataProject = data.map(function(item) {
                return {
                    ...item,
                    distance: Math.floor((new Date(item.end_date) - new Date(item.start_date)) / 2678400000 ), // asumsi milisecond per 31 hari
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date)
                }
            })

        })
    })
});

//Route delete Project
app.get('/delete-project/:id', function(request, response) {
    if(!request.session.user){
    request.flash('not-login', '*Anda belum login, silahkan login terlebih dahulu')
    return response.redirect('/login')
    }

    let id = request.params.id
   //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
        if (err) throw err //Menampilkan error koneksi database

    let query = `DELETE FROM public.tb_projects WHERE id=${id}`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            response.redirect('/');      
        })
    })

})

//ROUTE Edit Projct menampilkan halaman form Update
app.get('/edit-project/:id', function(request, response){
    if(!request.session.user){
    request.flash('not-login', '*Anda belum login, silahkan login terlebih dahulu')
    return response.redirect('/login')
    }

    let id = request.params.id

    db.connect(function(err, client, done) {
        if (err) throw err //Menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            let data = result.rows;

            response.render('edit-project', { data: data[0] });
        })
    })
});

//ROUTE Edit Project mengambil data form update
app.post('/edit-project/:id', upload.single('inputImage'), function(request, response){
    
    let id = request.params.id

    edit = request.body;

    let namaProject = edit.inputProjectTittle;
    let deskripsi = edit.projectDescription;
    let awalTanggal = edit.inputStartDate;
    let akhirTanggal = edit.inputEndDate;
    let distance = Math.floor((new Date(akhirTanggal) - new Date(awalTanggal)) / 2678400000 ); //asumsi milisecond per 31 hari
    let javascript = edit.js;
    let nodeJs = edit.nodejs;
    let reactJs = edit.reactjs;
    let vueJs = edit.vuejs;

    const image = request.file.filename

    
 //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
        if (err) throw err //Menampilkan error koneksi database

        const userId = request.session.user.id;

    let query = `UPDATE public.tb_projects
        SET name='${namaProject}', start_date='${awalTanggal}', end_date='${akhirTanggal}', description='${deskripsi}', technologies='{${javascript}, ${nodeJs}, ${reactJs}, 
        ${vueJs} }', image='${image}', user_id='${userId}'
        WHERE id='${id}'`;

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            response.redirect('/');
        })
                
    })

});

//Method Get utk menampilkan halaman Register
app.get('/register', function(request, response){

    response.render('register');
});

app.post('/register', function(request, response){
    let regist = request.body;

    let name = regist.inputName;
    let email = regist.inputEmail;
    let password = regist.inputPassword;

    const hashedPassword = bcrypt.hashSync(password, 10)

   //method connect memiliki anonymous function
    db.connect(function(err, client, done) {
    if (err) throw err //Menampilkan error koneksi database

    let query = `INSERT INTO public.tb_users (name, email, password)
                VALUES ('${name}', '${email}', '${hashedPassword}')`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database

            // console.log(result.rows.length);
            if(result.rows.length == 0){
                request.flash('success', 'Selamat! registrasi berhasil, silahkan login')
            }

            response.redirect('/login');

        })
    })

});

//Method Get utk menampilkan halaman login
app.get('/login', function(request, response){
    
    response.render('login');
});

//Method Post utk mengambil data pada halaman login
app.post('/login', function(request, response){
    
    let login = request.body;

    let email = login.inputEmail;
    let password = login.inputPassword;

    const hashedPassword = bcrypt.hashSync(password, 10)

    db.connect(function(err, client, done) {
    if (err) throw err //Menampilkan error koneksi database

    let query = `SELECT * FROM public.tb_users WHERE email='${email}'`

        client.query(query, function(error, result){
            if (err) throw err //Menampilkan error dari query database


            // console.log(result.rows.length);
            // console.log(result.rows[0]);

            if (result.rows.length == 0) {
                console.log("email belum terdaftar");
                request.flash('danger', '*email belum terdaftar, silahkan ke menu ')
                return response.redirect('/login')
                
            }
        
            const isMatch = bcrypt.compareSync(password, result.rows[0].password)
            console.log(isMatch);

            if (isMatch) {
                console.log("Login Berhasil");
                // request.flash('success', 'Login berhasil')
                

                request.session.isLogin = true

                request.session.user = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    email: result.rows[0].email,
                }
                response.redirect('/')

                console.log(request.session.user);
            }
            else {
                console.log("Password Salah");
                request.flash('wrongpass', '*email/password salah, silahkan masukkan kembali')
                response.redirect('/login')
                return
            }

        })
    })

});


app.get('/logout', function(request, response){
    request.session.destroy()

    response.redirect('/login')
})

function getFullTime(time){

    let month = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let fullTime = `${date} ${month[monthIndex]} ${year}`
    return fullTime
}

//Method menjalankan server
app.listen(port, function(){
   console.log(`server berjalan di port ${port}`);
})

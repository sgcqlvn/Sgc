// ======================
// SGC APP.JS - PHẦN 1
// Đăng nhập + tạo sổ + chuyển trang
// ======================


// Lấy dữ liệu sổ đã tạo

let books = JSON.parse(
    localStorage.getItem("sgc_books")
) || [];


// Sổ đang đăng nhập

let currentBook = JSON.parse(
    localStorage.getItem("sgc_currentBook")
) || null;



// ======================
// TẠO SỔ MỚI
// ======================

function createBook(){

    let username = prompt(
        "Nhập tên tài khoản:"
    );


    if(!username) return;


    let password = prompt(
        "Nhập mật khẩu:"
    );


    if(!password) return;



    let check = books.find(
        b => b.username === username
    );


    if(check){

        alert(
            "Tài khoản đã tồn tại"
        );

        return;

    }



    let newBook = {

        username: username,

        password: password,

        customers: [],

        history: [],

        profit: []

    };



    books.push(newBook);



    localStorage.setItem(
        "sgc_books",
        JSON.stringify(books)
    );


    alert(
        "Tạo sổ thành công"
    );

}





// ======================
// ĐĂNG NHẬP
// ======================


function login(){


    let username =
    document.getElementById(
        "username"
    ).value;



    let password =
    document.getElementById(
        "password"
    ).value;



    let book =
    books.find(

        b =>

        b.username === username &&

        b.password === password

    );



    if(!book){

        alert(
            "Sai tài khoản hoặc mật khẩu"
        );

        return;

    }



    currentBook = book;



    localStorage.setItem(
        "sgc_currentBook",
        JSON.stringify(book)
    );



    document
    .getElementById(
        "loginPage"
    )
    .classList.add(
        "hidden"
    );



    document
    .getElementById(
        "mainPage"
    )
    .classList.remove(
        "hidden"
    );



    renderCustomers();



}





// ======================
// ĐỔI MENU
// ======================


function openPage(id){


    let pages =
    document.querySelectorAll(
        ".content"
    );


    pages.forEach(

        p =>

        p.classList.add(
            "hidden"
        )

    );



    document
    .getElementById(id)
    .classList.remove(
        "hidden"
    );

}





// ======================
// HIỂN THỊ KHÁCH
// (tạm thời)
// ======================


function renderCustomers(){


    let list =
    document.getElementById(
        "customerList"
    );



    if(!list) return;



    list.innerHTML = "";



    if(
        !currentBook ||
        currentBook.customers.length === 0
    ){

        list.innerHTML =
        "<p>Chưa có khách hàng</p>";

        return;

    }



    currentBook.customers.forEach(

        c => {


            list.innerHTML += `

            <div class="customer-card">

            <h4>
            ${c.name}
            </h4>


            <p>
            Tiền vay:
            ${c.loan}
            </p>


            <p>
            Góp/ngày:
            ${c.daily}
            </p>


            </div>

            `;


        }

    );


}





// ======================
// THÊM KHÁCH (khung)
// ======================


function showAddCustomer(){

    alert(
        "Phần thêm khách sẽ nối ở File 4"
    );

}

// ===============================
// SGC APP.JS - PHẦN 1
// ĐĂNG NHẬP + TẠO SỔ + LƯU DỮ LIỆU
// ===============================


let books = JSON.parse(
    localStorage.getItem("sgc_books")
) || [];


let currentBook = JSON.parse(
    localStorage.getItem("sgc_currentBook")
) || null;



// ===============================
// LƯU DỮ LIỆU
// ===============================

function saveBook(){

    if(!currentBook) return;


    let index = books.findIndex(
        b => b.username === currentBook.username
    );


    if(index !== -1){

        books[index] = currentBook;

    }


    localStorage.setItem(
        "sgc_books",
        JSON.stringify(books)
    );


    localStorage.setItem(
        "sgc_currentBook",
        JSON.stringify(currentBook)
    );

}





// ===============================
// TẠO SỔ MỚI
// ===============================

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

        history: []

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





// ===============================
// ĐĂNG NHẬP
// ===============================

function login(){


    let username =
    document.getElementById(
        "username"
    ).value;



    let password =
    document.getElementById(
        "password"
    ).value;



    let book = books.find(

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


    saveBook();



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



    if(typeof renderCustomers === "function"){

        renderCustomers();

    }



    if(typeof updateStats === "function"){

        updateStats();

    }


}





// ===============================
// CHUYỂN MENU
// ===============================

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



    if(typeof updateStats === "function"){

        updateStats();

    }

}// ===============================
// SGC APP.JS - PHẦN 2
// THÊM KHÁCH + HIỂN THỊ KHÁCH
// ===============================


// ===============================
// THÊM KHÁCH
// ===============================

function showAddCustomer(){


    let name = prompt(
        "Tên khách hàng:"
    );


    if(!name) return;



    let phone = prompt(
        "Số điện thoại:"
    );



    let loan = Number(
        prompt("Số tiền vay:")
    ) || 0;



    let daily = Number(
        prompt("Tiền góp mỗi ngày:")
    ) || 0;



    let today =
new Date()
.toLocaleDateString("vi-VN");


let customer = {

    id: Date.now(),

    name: name,

    phone: phone,

    loan: loan,

    daily: daily,

    paid: 0,

    profit: 0,


    // ngày mượn ban đầu (giữ nguyên)
    loanDate: today,


    // lần dồn gần nhất
    lastMergeDate: "",


    // ngày bắt đầu dây hiện tại
    cycleDate: today,


    history: [],

    mergeHistory: []

};

    };



    currentBook.customers.push(
        customer
    );


    saveBook();


    renderCustomers();


    alert(
        "Đã thêm khách"
    );

}







// ===============================
// HIỂN THỊ DANH SÁCH KHÁCH
// ===============================

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
        (c,index)=>{


            
            let status = customerStatus(c);



            list.innerHTML += `

            <div class="customer-card ${status}">


            <h4>
            ${c.name}
            </h4>


            <p>
            📞 ${c.phone || ""}
            </p>


            <p>
            Tiền vay:
            ${c.loan.toLocaleString()} đ
            </p><p>
📅 Ngày mượn:
${c.loanDate || ""}
</p>

<p>
🔄 Dây hiện tại:
${c.cycleDate || ""}
</p>

<p>
🔁 Lần dồn gần nhất:
${c.lastMergeDate || "Chưa dồn"}
</p>


            <p>
            Góp/ngày:
            ${c.daily.toLocaleString()} đ
            </p>


            <p>
            Đã đóng:
            ${c.paid.toLocaleString()} đ
            </p><p>
${statusText(c)}
</p>
            
</p>



            <button onclick="collectMoney(${index})">

            💰 Thu tiền

            </button>



            <button onclick="mergeMoney(${index})">

            🔄 Dồn tiền

            </button>



            <button onclick="showHistory(${index})">

            📜 Lịch sử

            </button>


            </div>

            `;<button onclick="editCustomer(${index})">
✏️ Sửa
</button>

<button onclick="deleteCustomer(${index})">
🗑 Xóa khách
</button>


        }
    );

}





// ===============================
// XEM THÔNG TIN KHÁCH
// ===============================

function viewCustomer(index){


    let c =
    currentBook.customers[index];



    alert(

    "Tên: "
    + c.name +

    "\nTiền vay: "
    + c.loan.toLocaleString()
    + " đ" +

    "\nĐã đóng: "
    + c.paid.toLocaleString()
    + " đ" +

    "\nTổng lời: "
    + c.profit.toLocaleString()
    + " đ"

    );

}// ===============================
// SGC APP.JS - PHẦN 3
// THU TIỀN + LỊCH SỬ ĐÓNG + TỔNG THU
// ===============================



// ===============================
// THU TIỀN
// ===============================

function collectMoney(index){


    let c =
    currentBook.customers[index];



    let amount = Number(
        prompt(
            "Nhập số tiền khách đóng:"
        )
    ) || 0;



    if(amount <= 0){

        alert(
            "Số tiền không hợp lệ"
        );

        return;

    }



    let date =
    new Date()
    .toLocaleDateString("vi-VN");



    // cộng tiền đã đóng

    c.paid += amount;



    // lưu lịch sử khách

    c.history.push({

        type:"thu",

        amount:amount,

        date:date

    });



    // lưu lịch sử tổng

    currentBook.history.push({

        type:"thu",

        customer:c.name,

        amount:amount,

        date:date

    });



    saveBook();


    renderCustomers();


    updateStats();



    alert(
        "Đã thu "
        +
        amount.toLocaleString()
        +
        " đ"
    );

}






// ===============================
// XEM LỊCH SỬ ĐÓNG
// ===============================

function showHistory(index){


    let c =
    currentBook.customers[index];



    if(c.history.length === 0){

        alert(
            "Chưa có lịch sử"
        );

        return;

    }



    let text =
    "Lịch sử đóng:\n\n";



    c.history.forEach(h=>{


        text +=

        h.date
        +
        " : "
        +
        h.amount.toLocaleString()
        +
        " đ\n";


    });



    alert(text);

}






// ===============================
// TỔNG THU HÔM NAY
// ===============================

function totalTodayIncome(){


    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let total = 0;



    currentBook.history.forEach(h=>{


        if(
            h.type === "thu"
            &&
            h.date === today
        ){

            total += h.amount;

        }


    });



    return total;

}







// ===============================
// TỔNG THU THÁNG
// ===============================

function totalMonthIncome(){


    let now = new Date();


    let month =
    now.getMonth()+1;


    let year =
    now.getFullYear();



    let total = 0;



    currentBook.history.forEach(h=>{


        if(h.type === "thu"){



            let d =
            h.date.split("/");



            if(

            Number(d[1]) === month

            &&

            Number(d[2]) === year

            ){

                total += h.amount;

            }


        }


    });



    return total;

}// ===============================
// SGC APP.JS - PHẦN 4
// DỒN TIỀN + TÍNH LỜI + DÂY MỚI
// ===============================



// ===============================
// DỒN TIỀN
// ===============================

function mergeMoney(index){


    let c =
    currentBook.customers[index];



    if(c.paid <= 0){

        alert(
            "Khách chưa có tiền để dồn"
        );

        return;

    }



    // tiền trả lại khách

    let backMoney = Number(
        prompt(
            "Nhập tiền đưa lại khách:"
        )
    ) || 0;



    if(
        backMoney < 0 ||
        backMoney > c.paid
    ){

        alert(
            "Số tiền không hợp lệ"
        );

        return;

    }




    // phần lời

    let profit =
    c.paid - backMoney;



    let date =
    new Date()
    .toLocaleDateString("vi-VN");





    // lưu lịch sử dồn của khách

    c.mergeHistory.push({

        date: date,

        before: c.paid,

        returnMoney: backMoney,

        profit: profit

    });





    // cộng lời khách

    c.profit += profit;




    // tạo dây mới

    c.paid = 0;


    c.startDate = date;





    // lưu lịch sử tổng

    currentBook.history.push({

        type:"don",

        customer:c.name,

        amount:backMoney,

        profit:profit,

        date:date

    });




    saveBook();


    renderCustomers();


    updateStats();




    alert(

        "Dồn thành công\n\n"

        +

        "Trả khách: "

        +

        backMoney.toLocaleString()

        +

        " đ\n"

        +

        "Lời: "

        +

        profit.toLocaleString()

        +

        " đ"

    );

}






// ===============================
// XEM LỊCH SỬ DỒN
// ===============================

function showMergeHistory(index){


    let c =
    currentBook.customers[index];



    if(
        c.mergeHistory.length === 0
    ){

        alert(
            "Chưa có lịch sử dồn"
        );

        return;

    }




    let text =
    "Lịch sử dồn:\n\n";



    c.mergeHistory.forEach(h=>{


        text +=

        h.date

        +

        "\nTrước dồn: "

        +

        h.before.toLocaleString()

        +

        " đ\nTrả khách: "

        +

        h.returnMoney.toLocaleString()

        +

        " đ\nLời: "

        +

        h.profit.toLocaleString()

        +

        " đ\n\n";


    });



    alert(text);

}// ===============================
// SGC APP.JS - PHẦN 5
// THỐNG KÊ
// ===============================



// ===============================
// TỔNG DỒN HÔM NAY
// ===============================

function totalTodayMerge(){


    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let total = 0;



    currentBook.history.forEach(h=>{


        if(
            h.type === "don"
            &&
            h.date === today
        ){

            total += h.amount;

        }


    });



    return total;

}







// ===============================
// TỔNG DỒN THÁNG
// ===============================

function totalMonthMerge(){


    let now = new Date();


    let month =
    now.getMonth()+1;


    let year =
    now.getFullYear();



    let total = 0;



    currentBook.history.forEach(h=>{


        if(h.type === "don"){


            let d =
            h.date.split("/");



            if(

            Number(d[1]) === month

            &&

            Number(d[2]) === year

            ){

                total += h.amount;

            }


        }


    });



    return total;

}








// ===============================
// TỔNG LỜI HÔM NAY
// ===============================

function totalTodayProfit(){


    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let total = 0;



    currentBook.history.forEach(h=>{


        if(

        h.type === "don"

        &&

        h.date === today

        ){

            total += h.profit;

        }


    });



    return total;

}








// ===============================
// TỔNG LỜI THÁNG
// ===============================

function totalMonthProfit(){


    let now = new Date();


    let month =
    now.getMonth()+1;


    let year =
    now.getFullYear();



    let total = 0;



    currentBook.history.forEach(h=>{


        if(h.type === "don"){


            let d =
            h.date.split("/");



            if(

            Number(d[1]) === month

            &&

            Number(d[2]) === year

            ){

                total += h.profit;

            }


        }


    });



    return total;

}







// ===============================
// LỜI TỪNG KHÁCH
// ===============================

function customerProfit(index){


    let c =
    currentBook.customers[index];



    return c.profit || 0;

}







// ===============================
// CẬP NHẬT THỐNG KÊ
// ===============================

function updateStats(){


    if(!currentBook)
    return;



    let a =
    document.getElementById(
        "todayIncome"
    );


    if(!a)
    return;




    a.innerText =
    totalTodayIncome()
    .toLocaleString()
    + " đ";



    monthIncome.innerText =
    totalMonthIncome()
    .toLocaleString()
    + " đ";



    todayMerge.innerText =
    totalTodayMerge()
    .toLocaleString()
    + " đ";



    monthMerge.innerText =
    totalMonthMerge()
    .toLocaleString()
    + " đ";



    todayProfit.innerText =
    totalTodayProfit()
    .toLocaleString()
    + " đ";



    monthProfit.innerText =
    totalMonthProfit()
    .toLocaleString()
    + " đ";

}// ===============================
// PHẦN 6
// SỬA - XÓA - TÌM KIẾM KHÁCH
// ===============================


// Tìm khách

function searchCustomer(){

    let key =
    prompt("Nhập tên khách cần tìm:");

    if(!key) return;


    let result =
    currentBook.customers.filter(c =>
        c.name.toLowerCase()
        .includes(key.toLowerCase())
    );


    if(result.length === 0){

        alert("Không tìm thấy khách");

        return;
    }


    let text="Kết quả:\n\n";

    result.forEach(c=>{

        text +=
        c.name +
        " - " +
        c.loan.toLocaleString()
        +
        " đ\n";

    });


    alert(text);

}




// Sửa khách

function editCustomer(index){

    let c =
    currentBook.customers[index];


    let name =
    prompt(
        "Tên khách:",
        c.name
    );


    if(name)
    c.name=name;



    let phone =
    prompt(
        "Số điện thoại:",
        c.phone
    );


    if(phone)
    c.phone=phone;



    let daily =
    prompt(
        "Tiền góp/ngày:",
        c.daily
    );


    if(daily)
    c.daily=Number(daily);



    saveBook();

    renderCustomers();


}




// Xóa khách

function deleteCustomer(index){

    let c =
    currentBook.customers[index];


    let ok =
    confirm(
        "Xóa khách "+c.name+"?"
    );


    if(!ok)
    return;



    currentBook.customers.splice(
        index,
        1
    );


    saveBook();


    renderCustomers();
    alert(

        "Đã xóa khách"

    );

}


}// ===============================
// PHẦN 7
// TRẠNG THÁI KHÁCH HÀNG
// ===============================



// Kiểm tra khách đã đóng hôm nay chưa

function customerStatus(c){


    // Đã trả đủ

    if(c.paid >= c.loan){

        return "status-done";

    }



    let today =
    new Date()
    .toLocaleDateString("vi-VN");



    let paidToday = false;



    c.history.forEach(h=>{


        if(

            h.type === "thu"

            &&

            h.date === today

        ){

            paidToday = true;

        }


    });




    if(paidToday){

        return "status-paid";

    }



    return "status-unpaid";


}






// Lấy tên trạng thái

function statusText(c){


    let status =
    customerStatus(c);



    if(status==="status-done"){

        return "🟡 Hoàn tất";

    }



    if(status==="status-paid"){

        return "🟢 Đã đóng hôm nay";

    }



    return "🔴 Chưa đóng hôm nay";


}// ===============================
// PHẦN 8
// CÀI ĐẶT SỔ
// ===============================



// ===============================
// ĐỔI TÊN SỔ
// ===============================

function changeBookName(){


    let name =
    prompt(
        "Nhập tên mới cho sổ:"
    );


    if(!name)
    return;



    currentBook.bookName = name;


    saveBook();


    alert(
        "Đã đổi tên sổ"
    );

}






// ===============================
// ĐỔI MẬT KHẨU
// ===============================

function changePassword(){


    let pass =
    prompt(
        "Nhập mật khẩu mới:"
    );


    if(!pass)
    return;



    currentBook.password = pass;


    saveBook();


    alert(
        "Đã đổi mật khẩu"
    );

}







// ===============================
// ĐĂNG XUẤT
// ===============================

function logout(){


    localStorage.removeItem(
        "sgc_currentBook"
    );


    currentBook = null;



    document
    .getElementById(
        "mainPage"
    )
    .classList.add(
        "hidden"
    );



    document
    .getElementById(
        "loginPage"
    )
    .classList.remove(
        "hidden"
    );


}








// ===============================
// SAO LƯU DỮ LIỆU
// ===============================

function backupData(){


    let data =
    JSON.stringify(
        currentBook
    );



    let blob =
    new Blob(
        [data],
        {
            type:"application/json"
        }
    );



    let url =
    URL.createObjectURL(blob);



    let a =
    document.createElement("a");


    a.href = url;


    a.download =
    "SGC_backup.json";


    a.click();


    URL.revokeObjectURL(url);


}








// ===============================
// KHÔI PHỤC DỮ LIỆU
// ===============================

function restoreData(event){


    let file =
    event.target.files[0];


    if(!file)
    return;



    let reader =
    new FileReader();



    reader.onload =
    function(e){


        try{


            currentBook =
            JSON.parse(
                e.target.result
            );


            saveBook();


            renderCustomers();


            updateStats();



            alert(
                "Khôi phục thành công"
            );


        }
        catch{


            alert(
                "File không hợp lệ"
            );


        }


    };



    reader.readAsText(file);

}// ===============================
// PHẦN 9
// CÂY TỔNG - CÂY CON
// ===============================



// ===============================
// TẠO TÀI KHOẢN CON
// ===============================

function createChildAccount(){


    // chỉ chủ sổ mới được tạo con

    if(
        currentBook.role !== "owner"
        &&
        currentBook.role !== undefined
    ){

        alert(
            "Bạn không có quyền"
        );

        return;

    }




    let username =
    prompt(
        "Tên tài khoản con:"
    );



    if(!username)
    return;



    let password =
    prompt(
        "Mật khẩu tài khoản con:"
    );



    if(!password)
    return;




    if(!currentBook.children){

        currentBook.children=[];

    }



    let check =
    currentBook.children.find(
        c=>c.username===username
    );



    if(check){

        alert(
            "Tài khoản đã tồn tại"
        );

        return;

    }




    currentBook.children.push({

        username:username,

        password:password,

        role:"child",

        parent:
        currentBook.username

    });



    saveBook();



    alert(
        "Đã tạo tài khoản con"
    );

}







// ===============================
// ĐĂNG NHẬP TÀI KHOẢN CON
// ===============================

function loginChild(username,password){



    if(!currentBook.children)
    return null;



    let child =
    currentBook.children.find(

        c=>

        c.username===username
        &&
        c.password===password

    );



    return child || null;

}








// ===============================
// KIỂM TRA QUYỀN
// ===============================

function checkPermission(action){



    // chủ được làm tất cả

    if(
        currentBook.role==="owner"
        ||
        currentBook.role===undefined
    ){

        return true;

    }





    // tài khoản con

    if(
        currentBook.role==="child"
    ){


        let allow=[

            "collect",

            "merge",

            "addCustomer"

        ];



        return allow.includes(action);


    }



    return false;


}








// ===============================
// XÓA KHÁCH CHỈ CHỦ ĐƯỢC XÓA
// ===============================

function deleteCustomer(index){


    if(
        !checkPermission("deleteCustomer")
    ){

        alert(
            "Chỉ cây tổng được xóa khách"
        );

        return;

    }



    let ok =
    confirm(
        "Xóa khách này?"
    );



    if(!ok)
    return;



    currentBook.customers.splice(
        index,
        1
    );



    saveBook();


    renderCustomers();


}// ===============================
// PHẦN 10
// BẢO VỆ DỮ LIỆU + TỰ ĐĂNG XUẤT
// ===============================



// ===============================
// TỰ LƯU ĐỊNH KỲ
// ===============================

setInterval(function(){


    if(currentBook){

        saveBook();

    }


},30000); 
// 30 giây tự lưu 1 lần







// ===============================
// TỰ ĐĂNG XUẤT SAU 5 PHÚT
// ===============================


let lastActivity =
Date.now();



function resetActivity(){


    lastActivity =
    Date.now();


}





// ghi nhận thao tác người dùng

document.addEventListener(
    "click",
    resetActivity
);


document.addEventListener(
    "touchstart",
    resetActivity
);


document.addEventListener(
    "keydown",
    resetActivity
);







// kiểm tra mỗi 10 giây

setInterval(function(){


    if(!currentBook)
    return;



    let now =
    Date.now();



    let time =
    now - lastActivity;



    // 5 phút = 300000 ms

    if(time >= 300000){


        alert(
            "Đã tự đăng xuất do không hoạt động"
        );



        logout();


    }



},10000);








// ===============================
// TẢI LẠI DỮ LIỆU KHI MỞ TRANG
// ===============================


window.addEventListener(
"load",
function(){


    if(currentBook){


        let login =
        document.getElementById(
            "loginPage"
        );


        let main =
        document.getElementById(
            "mainPage"
        );



        if(login && main){


            login.classList.add(
                "hidden"
            );


            main.classList.remove(
                "hidden"
            );


        }



        if(typeof renderCustomers==="function"){

            renderCustomers();

        }



        if(typeof updateStats==="function"){

            updateStats();

        }


    }


});// ===============================
// PHẦN 11
// HOÀN THIỆN GIAO DIỆN KHÁCH
// ===============================



// ===============================
// TÍNH CÒN NỢ
// ===============================

function remainingDebt(c){


    let debt =
    c.loan - c.paid;


    if(debt < 0){

        debt = 0;

    }


    return debt;

}






// ===============================
// XEM CHI TIẾT KHÁCH
// ===============================

function openCustomerDetail(index){


    let c =
    currentBook.customers[index];



    let debt =
    remainingDebt(c);



    let text =

    "👤 Khách: "
    + c.name

    +

    "\n\n💰 Tiền vay: "
    + c.loan.toLocaleString()
    + " đ"

    +

    "\n💵 Đã đóng: "
    + c.paid.toLocaleString()
    + " đ"

    +

    "\n📌 Còn nợ: "
    + debt.toLocaleString()
    + " đ"

    +

    "\n📅 Ngày mượn: "
    + c.startDate

    +

    "\n\n⭐ Tổng lời: "
    + c.profit.toLocaleString()
    + " đ";



    alert(text);

}







// ===============================
// ẨN HIỆN SỐ ĐIỆN THOẠI
// ===============================

function hidePhone(phone){


    if(!phone)
    return "";



    if(phone.length < 6)
    return phone;



    return (

    phone.substring(0,3)

    +

    "***"

    +

    phone.substring(
        phone.length-3
    )

    );

}








// ===============================
// HIỂN THỊ THÔNG TIN SỔ
// ===============================

function bookInfo(){


    if(!currentBook)
    return;



    alert(

    "📒 Sổ: "

    +

    (currentBook.bookName || "SGC")

    +

    "\n👤 Tài khoản: "

    +

    currentBook.username

    +

    "\n👥 Số khách: "

    +

    currentBook.customers.length

    );

}







// ===============================
// ĐĂNG NHẬP LẠI AN TOÀN
// ===============================

function refreshData(){


    if(!currentBook)
    return;



    saveBook();


    renderCustomers();


    updateStats();


}

var express=require('express');
var app=express();
app.use(express.static('minishop'));
app.use(express.static('minishop/uploads'));
var bd=require('body-parser');
var ed=bd.urlencoded({extended:false});
app.set('view engine','ejs');

const session = require('express-session');
app.use(session({
  secret: 'madhav123@123', // Replace with a strong, random key
  resave: true,
  saveUninitialized: true
}));



const my = require('mysql');
const multer = require('multer');
const st = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, 'minishop/uploads/');
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: st });


const con= my.createConnection({
  host: '127.0.0.1',     
  user: 'root',          
  password: '',          
  database: 'madhavproject' 
});

con.connect((err) => {
  if (err) 
    throw err;
 
  console.log('Connected to mysql');
});
app.use(function(req, res, next) {
  res.locals.aname = req.session.aname;
  res.locals.aemail= req.session.aemail;
res.locals.uname = req.session.uname;
  res.locals.uemail= req.session.uemail;

  next();
});
app.get("/",function(req,res)
{
var q="select * from product";
con.query(q,function(err,result)
{
if(err)
throw err;
res.render("index",{data:result});
});
});

app.get("/index",function(req,res)
{
res.redirect("/");
});

app.get("/contact",function(req,res)
{
res.sendFile("./minishop/contact.html",{root:__dirname});
});

app.get("/shop",function(req,res)
{
var q="select * from product";
con.query(q,function(err,result)
{
if(err)
throw err;
res.render("shop",{data:result});
});
})

app.get("/about",function(req,res)
{
res.sendFile("./minishop/about.html",{root:__dirname});
});

app.get("/cart",function(req,res)
{
  if(req.session.uemail==null)
    res.redirect("login");
  else
  {
 var e=req.session.uemail;
 var q="select * from cart where email='"+e+"'";   
 con.query(q,function(err,result){
res.render("cart",{data:result});
 })

  }
});

app.get("/product-single",function(req,res)
{
res.sendFile("./minishop/product-single.html",{root:__dirname});
});

app.get("/blog",function(req,res)
{
res.sendFile("./minishop/blog.html",{root:__dirname});
});


app.get("/checkout",function(req,res)
{
res.render("checkout");
});

app.get("/login",function(req,res)
{
res.sendFile("./minishop/login.html",{root:__dirname});
});

app.get("/register",function(req,res)
{
res.sendFile("./minishop/register.html",{root:__dirname});
});

app.get("/admin",function(req,res)
{
res.sendFile("./minishop/admin.html",{root:__dirname});
});

app.get("/addproduct",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
res.render("addproduct");
}
});


app.post("/registerprocess",ed,function(req,res)
{
var n = req.body.nam;
var e= req.body.em;
var p = req.body.ph;
var pw = req.body.pw;
 var q ="insert into users values ('"+n +"','"+e+"' ,'" +p+"' ,'"+pw+"' )";
con.query(q, function (err,result)
{
if (err) 
throw err;
res.send("You are register")
});
});

app.post("/loginprocess",ed,function(req,res)
{
var e = req.body.email;
var p= req.body.password;
var q="select * from users where email='"+e+"'";
con.query(q, function (err,result)
{
if (err) 
throw err;
var L=result.length;
if(L>0)
{
if(result[0].passward==p)
{
req.session.uname=result[0].Name;
req.session.uemail=result[0].email;
res.redirect("index");
}
else
{
res.send("InValid Password");
}
}
else
res.send("InValid Email");
});
});

app.post("/adminLogin",ed,function(req,res)
{
var e = req.body.email;
var p= req.body.password;
var q="select * from admin where email='"+e+"'";
con.query(q, function (err,result)
{
if (err) 
throw err;
var L=result.length;
if(L>0)
{
if(result[0].password==p)
{
req.session.aname=result[0].name;
req.session.aemail=result[0].email;
res.render('dashboard');
}
else
res.send("InValid Password");
}
else
res.send("InValid Email");
});
});

app.get("/dashboard",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
res.render('dashboard');
}
});


app.get("/contactproceszs",function(req,res)
{
var a = req.query.Na;
var b= req.query.ema;
var c = req.query.sub;
var dw = req.query.mes;
var q ="insert into contact values ('"+a+"','"+b+"' ,'" +c+"' ,'"+dw+"' )";
con.query(q, function (err,result)
{
if (err) 
throw err;
res.send("Message is submitted")
});
});

app.get("/viewusers",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
var q="select * from users";
con.query(q,function(err,result)
{
res.render("vuser",{data:result});
})
}
});
app.get("/enquiry",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
var q="select * from contact";
con.query(q,function(err,result)
{
res.render("enquiry",{data:result});
})
}
});

app.get ("/delcontact",(req,res)=>{

    em=req.query.email;
var q="delete from contact where email='"+em+"'";

con.query(q,(err,result)=>{
   if (err)
       throw err;
     res.redirect("enquiry");
})
});

app.get ("/delusers",(req,res)=>{
    em=req.query.email;
var q="delete from users where email='"+em+"'";

con.query(q,(err,result)=>{
   if (err)
       throw err;
     res.redirect("vuser");
})
});

app.post("/Addprocess",ed,upload.single('imga'),function(req,res)
{
var a = req.body.id;
var b = req.body.name;
var c= req.body.category;
var d= req.body.quantity;
var e = req.body.price;
var f = req.body.description;
var g = req.file.filename;

var q ="insert into product values ('"+a+"','"+b+"' ,'" +c+"' ,"+d+" ,"+e+",'"+f+"','"+g+"')";
con.query(q, function (err,result)
{
if (err) 
throw err;
res.send("Product is Upload")
});

});

app.get ("/delproduct",(req,res)=>{
    em=req.query.id;
var q="delete from product where id='"+em+"'";

con.query(q,(err,result)=>{
   if (err)
       throw err;
     res.redirect("viewproduct");
})
});

app.get("/ViewProduct",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
var q="select * from product";
con.query(q,function(err,result)
{
res.render("viewproduct",{data:result});
})
}
});


 app.get("/Setting",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
res.render("Setting");
});

app.post("/updatepwd",ed,function(req,res)
{
var m = req.session.aemail;

var a = req.body.new;
var b= req.query.old;
var c = req.query.confirm;
var q =" update  admin set password = '"+a+"' where email ='"+m+"'";
con.query(q, function (err,result)
{
if (err) 
throw err;
res.send("Password is update")
});
});

app.get("/addcart", function(req,res)
{
if (req.session.uemail==null)
res.redirect("login");
else
{
var n = req.session.uname;
var e = req.session.uemail;
var id = req.query.id;
var pname = req.query.name;
var pcategory = req.query.cat;
var price = req.query.pr;
var image = req.query.img;
var qt="select * from cart where email='"+e+"' and id='"+id+"'";
con.query(qt,function(err,result){
var L=result.length;
if(L>0)
  res.send("Product Allready added into cart");
else
{
var q ="insert into cart values ('"+n +"','"+e+"' ,'" +id+"' ,'"+pname+"','"+pcategory+"',"+price+",'"+image+"' )";
con.query(q, function (err,result)
{
if (err) 
throw err;
res.send("Your Product Added into cart");
});
}
});

}
});


app.get("/deletecart", function(req, res) {
   if(req.session.uemail==null) {
    res.redirect("login");
  } else
     {
    var id = req.query.id;
    var q = "DELETE FROM cart WHERE id = ?";
    con.query(q,id, function(err, result) {
      if (err)
         throw err;
      res.redirect("cart"); 
    });
  }
});



app.post("/Billingprocess",ed,function(req,res)
{
  if(req.session.uemail==null)
    res.redirect("login");
  else
  {
var n = req.session.uname;
var e = req.session.uemail;
var b = req.body.fname;
var c = req.body.lname;
var d = req.body.email;
var st = req.body.state;
var f= req.body.addrss;
var g = req.body.city;
var h = req.body.pincode;
var ph = req.body.pnumber;
var pm = req.body.paymentmode;
var qt="select productname,price,image from cart where email='"+e+"'";
con.query(qt,function(err,result){
var PN="";
var pr=0;
var img="";
for(i=0;i<result.length;i++)
  {
    PN=PN+result[i].productname+",";
    pr=pr+result[i].price;
    img=img+result[i].image+",";
  }

  var q ="insert into orders(fname,lname,email,state,addrss,city,postalcode,phone,productname,productimage,amount,paymentmode) values ('"+b+"','"+c+"' ,'" +e+"' ,'"+st+"' ,'"+f+"','"+g+"',"+h+",'"+ph+"','"+PN+"','"+img+"',"+pr+",'"+pm+"')";
con.query(q, function (err,result)
{

if (err) 
throw err;
var qt="delete from cart where email='"+e+"'";
con.query(qt,function(err,result){
res.send("Order Placed")
});

});

})
  }
});

app.get("/ViewOrder",function(req,res)
{
if(req.session.aname==null)
res.redirect("admin");
else
{
var q="select * from orders";
con.query(q,function(err,result)
{
res.render("ViewOrder",{data:result});
})
}
});


 app.get("/delorders",function(req,res){
  if(req.session.uemail==null) {
    res.redirect("login");
  } else
     {
    var a = req.query.orderid;
    var q = "Delete from orders where orderid='"+a+"'";
    con.query(q,function(err, result) {
      if (err)
         throw err;
      res.redirect("ViewOrder"); 
    });
  }
  
 })


app.get("/Alogout",function(req,res)
{
req.session.destroy((err) => {
  res.redirect('admin'); 
})

});

app.get("/ulogout",function(req,res)
{
req.session.destroy((err) => {
  res.redirect('login'); 
})

});

app.get("/uservieworders",function(req,res){
if(req.session.uname==null)
res.redirect("login");
else
{
  var e=req.session.uemail;
var q="select * from orders where email='"+e+"'";
con.query(q,function(err,result)
{
res.render("viewuserorder",{data:result});
})
}

});

app.listen(2000,function()
{
console.log("Server Started at Port Number 2000");
});


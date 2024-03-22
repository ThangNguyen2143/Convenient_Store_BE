var fonts = {
    Roboto: {
      normal: 'fonts/DejaVuSans.ttf',
      bold: 'fonts/DejaVuSans-Bold.ttf',
      italics: 'fonts/DejaVuSans.ttf',
      bolditalics: 'fonts/DejaVuSans.ttf'
    }
 }
 
 var PdfPrinter = require('pdfmake');
 var printer = new PdfPrinter(fonts);
 var fs = require('fs');
 const moment = require('moment')
 moment.locale('vi')

var convertMoney= (num) =>{
    if(!isNaN(parseInt(num)))
        return num.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    else return num
}
 module.exports = (invoice)=>{
    var data = {
        invoicenumber: invoice['No'],
        buyername:   invoice['name'],
        buyeraddress: invoice['address'],
        item: invoice['detailOrder'],
        price: invoice['ThanhTien'],
        date: invoice['createdAt'],
    }
    
    var docDefinition = {
        content: [
            {
                fontSize: 11,
                table:{
                    widths: ['50%','50%'],
                    body:[
                            [{text:'Liên 1: Lưu', 
                                border:[false,false,false,true],
                                margin:[-5,0,0,10]
                            },
                            {text:'CHBH#'+data.invoicenumber,
                                alignment:'right',
                                border:[false,false,false,true],
                                margin:[0,0,0,10]
                            }]
                        ]
                    }
            },
            {
                layout: 'noBorders',
                fontSize: 11,
                table:{
                    widths: ['33%','33%','33%'],
                    body:[
                        [{text:'bachhoaBH.com',
                            margin:[0,10,0,0]},
                        {text:'',alignment:'centre',margin:[0,10,0,0] },
                        {text:'Ngày lập: '+ moment(data.date).format('DD/MM/YYYY, HH:mm'),
                        alignment:'right',margin:[0,10,0,0]
                        }],
                        ['','',''],
                        [{colSpan: 3, text:'HOÁ ĐƠN GTGT', bold: true, fontSize: 24, alignment: 'center'},'',''],
                        [' ','','']
                    ]
                }
            },
            {
                fontSize: 11,
                table:{
                    widths: ['50%','50%'],
                    body:[
                        [{text:' ', 
                            border:[false,false,false,true],
                            margin:[0,0,0,10]},
                        {text:'Thành tiền: '+convertMoney(data.price), 
                        alignment:'right', 
                        border:[false,false,false,true],
                        margin:[0,0,0,10]
                        }]
                    ]
                }
            },
            {
                layout: 'noBorders',
                fontSize: 11,
                table:{
                    widths: ['100%'],
                    body:[
                        [{text:'Khách hàng:',margin:[0,10,0,0]}],
                        [data.buyername],
                        [data.buyeraddress],
                    ]
                }
            },
            {
                fontSize: 11,
                table:{
                    widths: ['5%','51%','15%','13%','15%'],
                    body:[
                        [{text:'STT', border:[false,true,false,true]},{text:'Sản phẩm', border:[false,true,false,true]},{text:'Giá', border:[false,true,false,true]},{text:'SL',alignment:'center', border:[false,true,false,true]},{text:'T.Tiền', border:[false,true,false,true]}],
                        
                    ]
                }
            },
            {
                layout: 'noBorders',
                fontSize: 11,
                margin:[0,0,5,0],
                table:{
                    widths: ['85%','15%'],
                    body:[
                        [{text:'Tổng cộng:', alignment:'right',margin:[0,5,0,0]},{text:convertMoney(data.price),margin:[0,5,0,0]}],
                        [{text:'Thuế %:', alignment:'right'},convertMoney(0)],
    
                    ]
                }
            },
            {
                fontSize: 11,
                table:{
                    widths: ['85%','15%'],
                    body:[
                        [{text:'Thanh toán:', alignment:'right', border:[false,false,false,true],margin:[0,0,0,10]},{text:convertMoney(data.price), border:[false,false,false,true],margin:[0,0,0,10]}]
                    ]
                }
            },
            {
                layout: 'noBorders',
                fontSize: 11,
                alignment: 'center',
                table:{
                    widths: ['100%'],
                    body:[
                        [{text:' ',margin:[0,10,0,0]}],
                        ['Cửa hàng bách hoá HvT'],
                        ['Địa chỉ: Hưng Lợi, Ninh Kiều, Cần Thơ'],
                        ['bachhoaHvt.com'],
                        ['Hẹn gặp lại']
                    ]
                }
            }
        ]
    
    };
    for(var i=0; i<data.item.length; i++) {
        docDefinition.content[4].table.body.push(
                [{text:''+(i+1), 
                 border:[false,true,false,true]},
                {text:data.item[i].name,
                 border:[false,true,false,true]},
                {text:convertMoney(data.item[i].price),
                 border:[false,true,false,true]},
                {text:data.item[i].quantity,
                 alignment:'center', 
                 border:[false,true,false,true]},
                {text:convertMoney(data.item[i].total), 
                 border:[false,true,false,true]}]
        )
    }
    

    var options = {};
    
    // create invoice and save it to invoices_pdf folder 
    var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(fs.createWriteStream('src/public/invoices_pdf/'+data.invoicenumber+'.pdf'));
    pdfDoc.end();
 }
 


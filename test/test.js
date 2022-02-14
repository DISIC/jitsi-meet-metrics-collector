const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const dbconnect = require("./db/dbconnect.js");




// const server = require("./app/app.js");


chai.use(chaiHttp);

// describe('hooks', function() {
//     before(
//         ()=>{
//             console.log("Coucou");
//         }
//     );

//     it('It should return a javascript file', (done) => {
//         chai.request(server)
//             .get('/getClient')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 done();
//             });
//     });

//   });
  


// var mongod = MongoMemoryServer.create({
//     instance: {
//       port: 2727, // by default choose any free port
//       ip: '127.0.0.1', // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
//       dbName: 'test', // by default '' (empty string)
//     }    
// })
// .then(
//     (mongod)=>{
//         console.log("Mongodb is available on "+mongod.getUri());

//         var server = require('./appTest');
//         describe('jmmc test', function(){
        
//             it('It should return a javascript file', (done) => {
//                 chai.request(server)
//                     .get('/getClient')
//                     .end((err, res) => {
//                         res.should.have.status(200);
//                         done();
//                     });
//             });
        
//             // it('it should not POST an empty metrics object', (done) => {
//             //     let data = {
//             //         conf: 'test12345',
//             //         uuid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
//             //         m: {
//             //             br: "chrome 97",
//             //             os: "windows",
//             //         }
//             //     }
//             //   chai.request(server)
//             //       .post('/push')
//             //       .send(data)
//             //       .end((err, res) => {
//             //             res.should.have.status(200);
//             //             res.body.should.be.a('object');
//             //         done();
//             //       });
//             // });
//         })

//         return mongod.stop();
//     }
// );
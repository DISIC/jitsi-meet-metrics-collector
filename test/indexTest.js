const chai = require('chai');
const server = require('./app/appTest');
const chaiHttp = require('chai-http');
const  should = chai.should();
chai.use(chaiHttp);

console.log("index test")
describe('jmmc test', function(){

    it('It should return a javascript file', (done) => {
        chai.request(server)
            .get('/getClient')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    }).timeout(10000);

    it('it should not POST an empty metrics object', (done) => {
        let data = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
            }
        }
        
        chai.request(server)
            .post('/push')
            .send(data)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('it should POST 2 users in the conf with new session for each if the metrics object has the "br" variable', (done) => {
        let data1 = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
                br: "chrome 97",
                os: "windows",
            }
        }
        let data2 = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120003',
            m: {
                br: "chrome 97",
                os: "windows",
            }
        }
        chai.request(server)
          .post('/push')
          .send(data1)
          .end((err, res) => {
                chai.request(server)
                .post('/push')
                .send(data2)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    it("it should add for each user's current session an object of the new validated metrics", (done) => {
        let data1 = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
                u:{
                    bw: 500
                },
                d:{
                    bw: 600
                },
                t:{
                    p: 80
                }
            }
        }
        let data2 = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120003',
            m: {
                u:{
                    bw: 500
                },
                d:{
                    bw: 600
                },
                t:{
                    p: 80
                }
            }
        }
        chai.request(server)
          .post('/push')
          .send(data1)
          .end((err, res) => {
                chai.request(server)
                .post('/push')
                .send(data2)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    it('it should not POST an empty metrics object', (done) => {
        let data = {
            conf: 'testconf12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
            }
        }
        
        chai.request(server)
            .post('/push')
            .send(data)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('it should not POST invalid data', (done) => {
        let data = {
            // conf: 'test12345',
            uid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
                cq: 100
            }
        }
        
        chai.request(server)
            .post('/push')
            .send(data)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });
})
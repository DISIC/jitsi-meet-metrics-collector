const chai = require('chai');
const server = require('./appTest');
const chaiHttp = require('chai-http');
const  should = chai.should();
chai.use(chaiHttp);

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
            conf: 'test12345',
            uuid: 'a40bcaa8-8b36-11ec-a8a3-0242ac120002',
            m: {
                br: "chrome 97",
                os: "windows",
            }
        }
      chai.request(server)
          .post('/push')
          .send(data)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            done();
          });
    });
})
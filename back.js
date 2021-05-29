'use strict';

const fs = require('fs');

class Account {
  constructor(login, name, birth, country, city, info) {
    this.login = login;
    this.name = name;
    this.birth = birth;
    this.country = country;
    this.city = city;
    this.info = info;
  }

  toString() {
    return 'User: ' + this.login + '\nFull name: ' + this.name +
      '\nAge: ' + this.age + '\nCountry: ' + this.country + ' City ' +
      this.city + '\nInfo: ' + this.info;
  }
}

class Back {

  // TODO IN FRONT:
  // FIRSTLY, NEED TO CHECK/CREATE DATABASE IN DIRECTORY OF PROJECT

  checkDB() {
    return new Promise(resolve => {
      fs.mkdir('data', err => {
        const files = ['authorize', 'info', 'friends', 'news'];
        const dirs = ['messages', 'dropbox'];

        if (err) {
          for(let i = 0; i < files.length; i++){
            fs.readFile('data/' + files[i], err => {
              if(err){
                fs.writeFile('data/' + files[i], '', err => {
                  if(err){
                    console.log('Problem apeared while creating ' + files[i]);
                    resolve();
                    return;
                  }  
                });
              }
            });
          }

          for(let i = 0; i < dirs.length; i++){
            fs.mkdir('data/' + dirs[i], err => {
              if(err) resolve();
            });
          }

          return;
        }

        for(let i = 0; i < files.length; i++){
          fs.writeFile('data/' + files[i], '', err => {
            if(err){
              console.log('Problem appeared while creating ' + files[i]);
              resolve();
              return;
            }
          });
        }

        for(let i = 0; i < dirs.length; i++){
          fs.mkdir('data/' + dirs[i], err => {
            if(err){
              console.log('Problem appeared while creating dir ' + dirs[i]);
              resolve();
              return;
            }
          });
        }
        resolve();
      });
    });
  }

  createAccount(login, password){ 
    return new Promise((resolve, reject) => {
      fs.readFile('data/authorize', (err, data) => {
        if (err){
          console.log('CHECK YOUR DB!');
          throw err;
        }

        const users = data.toString().split('\n');
        if(users[users.length - 1] === '') users.pop();
        for (let i = 0; i < users.length; i++) {
          const user = users[i].split(' - ');
          if (login === user[0]){
            console.log('LOGIN IS ALREADY USED');
            resolve(false);
            return;
          }
        }

        fs.appendFile('data/authorize', login + ' - ' + password + '\n', err => {
          if (err){
            console.log('SMTH WENT WRONG WHILE APPENDING DATA');
            reject();
          }

          resolve(true);
        });
      });
    });
  }

  checkAccount(login, password){ 
    return new Promise( resolve => {
      fs.readFile('data/authorize', (err, data) => {
        if (err){
          console.log('CHECK DB');
          resolve();
          return
        }

        const users = data.toString().split('\n');
        if(users[users.length - 1] === '') users.pop();
        for (let i = 0; i < users.length; i++) {
          const user = users[i].split(' - ');
          if (login === user[0] && password === user[1]){
            //console.log('ACC EXISTS');
            resolve(true);
            return
          }
        }

        console.log('INCORRECT USER DATA');
        resolve(false);
      });
    });
  }

  // INFO-ARRAY INTERFACE: [FULL NAME, BIRTH, COUNTRY, CITY, INFO]

  async addInfo(login, info){
    const user = new Account(login, ...info);
    fs.appendFile('data/info', JSON.stringify(user) + '\n', err => {
      if (err) {
        console.log('SMTH went wrong while appending data');
        return;
      }
    });
  }

  getInfo(login){
    return new Promise(resolve => {
      fs.readFile('data/info', (err, data) => {
        if (err) {
          console.log('CHECK YOUR DB');
          return;
        }

        const content = data.toString().split('\n');
        if(content[content.length - 1] === ''){
          content.pop();
        }
        for (const line of content) {
          const user = JSON.parse(line);
          if (user.login === login) {
            resolve(user);
          }
        }
      });
    })
  }

  async changeInfo(login, newInfo){
    fs.readFile('data/info', (err, data) => {
      if(err){
        console.log('Check your DB');
        process.exit(0);
      }

      const content = data.toString().split('\n');
      if(content[content.length - 1] === ''){  
        content.pop();
      }
      
      for(let i = 0; i < content.length; i++){
        const user = JSON.parse(content[i]);
        if(user.login === login){
          content[i] = JSON.stringify(newInfo);
          fs.writeFile('data/info', content.join('\n') + '\n', () => {});
        }
      }
    });
  }

  async addMessage(from, to, message){
    fs.readFile('data/messages/' + from + ' - ' + to, err => {
      if(err){
        fs.readFile('data/messages/' + to + ' - ' + from, err => {
          if(err){
            fs.writeFile('data/messages/' + from + ' - ' + to,
                        from + ': ' + message + '\n', () => {});
            return;
          }

          fs.appendFile('data/messages/' + to + ' - ' + from,
                        from + ': ' + message + '\n', () => {});
          return;
        });

        return;
      }

      fs.appendFile('data/messages/' + from + ' - ' + to,
                    from + ': ' + message + '\n', () => {});
    });
  }

  getMessages(from, to){
    return new Promise(resolve => {
      fs.readFile('data/messages/' + from + ' - ' + to, (err, data) => {
        if(err){
          fs.readFile('data/messages/' + to + ' - ' + from, (err, data) => {
            if(err){
              resolve();
              return;
            }

            const content = data.toString().split('\n');
            content.pop();
            resolve(content);
          });
          
          return;
        }

        const content = data.toString().split('\n');
        content.pop();
        resolve(content);
      });
    });
  }

  async changePassword(login, newPassword){
    fs.readFile('data/authorize', (err, data) => {
      if(err){
        console.log('Check your DB');
        process.exit(0);
      }

      const content = data.toString().split('\n');
      if(content[content.length - 1] === '') content.pop();
      for(let i = 0; i < content.length; i++){
        const account = content[i].split(' - ');
        if(account[0] === login){
          content[i] = login + ' - ' + newPassword;

          if(content.length === 1){
            content[0] += '\n';
            fs.writeFile('data/authorize', content[0], () => {});  
          } else {
            fs.writeFile('data/authorize', content.join('\n'), () => {});
          }
        }
      }
    });
  }

  async sendFile(to, path){
    fs.mkdir('data/dropbox/' + to, () => {
      const file = path.split('/').pop();
      fs.copyFile(path, 'data/dropbox/' + to + '/' + file, err => {
        if(err){
          console.log('Something went wrong while sending:\n');
          throw err;
        }
      });
    });
  }

  getChats(login){
    return new Promise(resolve => {
      fs.readdir('data/messages', (err, files) => {
        if(err){
          console.log('Smth went wrong in reading dir');
          resolve();
        }

        let result = [];
        for(let i = 0; i < files.length; i++){
          const file = files[i].split(' - ');
          const index = file.indexOf(login);
          
          if(index === -1){
            continue;
          } else {
            const chat = file.filter(user => user !== login);
            result = result.concat(chat);
          }
        }

        resolve(result);
      });
    });
  }

  async addNews(login, news){
    fs.readFile('data/news', err => {
      if(err){
        console.log('Check DB');
        return;
      }

      fs.appendFile('data/news', login + ': ' + news + '\n', () => {});
    });
  }

  getNews(){
    return new Promise(resolve => {
      fs.readFile('data/news', (err, data) => {
        if(err){
          console.log('Check DB');
          return;
        }

        const content  = data.toString().split('\n');
        if(content[content.length - 1] === ''){
          content.pop();
        }

        resolve(content);
      });
    });
  }

  checkFriends(login, friend, users){
    for(let i = 0; i < users.length; i++){
      const user = users[i].split(': ');
      if(user[0] === login){
        const friends = user[1].split(', ');
        for(let j = 0; j < friends.length; j++){
          if(friends[j] === friend) return true;
        }
      }
    }

    return false;
  }

  async addFriend(login, friend){
    fs.readFile('data/friends', async (err, data) => {
      if(err){
        console.log('Check DB');
        return;
      }

      const content = data.toString().split('\n');
      if(content[content.length - 1] === '') content.pop();
      if(this.checkFriends(login, friend, content)) return;

      let flag = true;
      for(let i = 0; i < content.length; i++){
        const user = content[i].split(': ');
        if(user[0] === login){
          user[1] = user[1] + ', ' + friend;
          content[i] = user.join(': ');
          flag = false;
          fs.writeFile('data/friends', content.join('\n') + '\n', () => {});
          break;
        }
      }

      if(flag) fs.appendFile('data/friends', login + ': ' + friend + '\n', () => {});
      await this.addFriend(friend, login);
    });
  }

  getFriends(login){
    return new Promise(resolve => {
      fs.readFile('data/friends', (err, data) => {
        if(err){
          console.log('Check DB');
          resolve();
          return;
        }

        const content = data.toString().split('\n');
        if(content[content.length - 1] === '') content.pop();
        for(let i = 0; i < content.length; i++){
          const user = content[i].split(': ');
          if(user[0] === login){
            resolve(user[1].split(', '));
            break; 
          }
        }
      });
    });
  }
}

module.exports = Back;

(async () => {
  const back = new Back();
  await back.checkDB();
})();
const electron = require('electron')
const { exec } = require('child_process');

function startDocker() {
    exec("docker start eosio", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stdout.trim() == "eosio") {
            
        }  else {
            
        }
        
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        checkDocker();
      });
}
function stopDocker() {
    exec("docker stop eosio", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stdout.trim() == "eosio") {
            
        }  else {
            
        }
        
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        $("#wallet-list").html("");
        checkDocker();
      });
}
function checkDocker() {
    exec("docker inspect -f '{{.State.Running}}' eosio", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stdout.trim() == "false") {
            $("#dockerWarning").show();
            $("#dockerRunning").hide();
        }  else {
            $("#dockerWarning").hide();
            $("#dockerRunning").show();
            listWallets();
            listKeys();
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
}
function createWallet() {
    if ($("#walletName").val()) {
        cmd = "docker exec eosio /opt/eosio/bin/cleos wallet create --name "+$("#walletName").val()+" --to-console";
    } else {
        cmd = "docker exec eosio /opt/eosio/bin/cleos wallet create --to-console";
    }
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        $("#walletInfo").show();
        $("#walletInfo .well").html(stdout);
        listWallets();
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
}
function listWallets() {
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet open', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet list', (error, stdout, stderr) => {
        if (error) {
        console.error(`exec error: ${error}`);
        return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        resArray = stdout.split("[");
        justWallets = resArray[1].substring(-1);
        walletArray = justWallets.split(",");
        console.log(walletArray);
        $("#wallet-list").html("");
        for ( i = 0; i < walletArray.length; i++) {
            
            if (walletArray[i].indexOf('*') > -1) {
                content = '<li class="list-group-item">'+cleanString(walletArray[i])+' <span class="label label-success">unlocked</span>';
            } else {
                content = '<li class="list-group-item">'+cleanString(walletArray[i])+' <span class="label label-danger">locked</span><input type="text" id="privateKey" placeholder="privateKey" /><button onclick="unlockWallet();">Unlock</button>';
            }

            content = content + '</li>';
            // <br /><input type="text" placeholder="accountName" /><button onclick="createAccount('+"'"+cleanString(walletArray[i])+''+"'"+')">Create Account</button>
            $("#wallet-list").append(content);
            
        }

    });
  });
}
function cleanString(walletName) {
    walletName = walletName.replace('"','');
    walletName = walletName.replace('*','');
    walletName = walletName.replace('"','');
    walletName = walletName.replace(']','');
    walletName = walletName.trim();
    return walletName;
}
function createAccount(walletName) {
    alert(walletName);
}
var activeKey;
function listKeys() {
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet open', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet keys', (error, stdout, stderr) => {
        if (error) {
        console.error(`exec error: ${error}`);
        return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        resArray = stdout.split("[");
        justWallets = resArray[1].substring(-1);
        walletArray = justWallets.split(",");
        console.log(walletArray);
        $("#key-list").html("");
        for ( i = 0; i < walletArray.length; i++) {
            activeKey = cleanString(walletArray[i]);
            content = '<li class="list-group-item">'+cleanString(walletArray[i]);
            content = content + "<br /><strong>Accounts</strong><ul id="+activeKey+">";
            exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 get accounts '+cleanString(walletArray[i]), (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);

                resArray = stdout.split("[");
                justWallets = resArray[1].substring(-1);
                accountArray = justWallets.split(",");
                console.log(accountArray);
                for ( i = 0; i < accountArray.length; i++) {
                    content = content + "<li>"+cleanString(accountArray[i])+"</li>";
                }
                return content;
            });
            content = content + "</ul><input type='text' placeholder='accountName' id='accountName' /><input type='text' placeholder='privateKey' id='privateKey' /><button onclick='createAccount(\""+cleanString(walletArray[i])+"\")'>Create Account</button>";
            content = content + '</li>';

            $("#key-list").append(content);
            
        }

    });
  });
}
function unlockWallet() {
    cmd = 'docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet open';
    console.log(cmd);
    exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    
    cmd = 'docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet unlock -n default --password '+$("#privateKey").val();
    console.log(cmd);
    exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    listWallets();
    listKeys();
});
    });
}
function createAccount(publicKey) {
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 wallet unlock -n default --password '+$("#privateKey").val(), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    exec('docker exec eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555 create account eosio '+$("#accountName").val()+" "+publicKey, (error, stdout, stderr) => {
        if (error) {
        console.error(`exec error: ${error}`);
        return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        resArray = stdout.split("[");
        justWallets = resArray[1].substring(-1);
        walletArray = justWallets.split(",");
        console.log(walletArray);
        $("#key-list").html("");
        listKeys();
    });
  });
}


  // Check to see if eosio is running
  checkDocker();


  
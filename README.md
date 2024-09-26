# Truncate2023-BE
###### Truncate Backend


## Live Server Setup


### Basis Setup

#### 1. install node

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# install node v18
nvm install 18
nvm alias default 18
```

#### 2. install pm2 and nestJS

```bash
npm install pm2@latest @nestjs/cli -g
```

#### 3. setup action runner

[Create Self-Hosted GitHub Action Runner](https://github.com/organizations/Truncatemusic/settings/actions/runners/new)

- use runner group: `Live`
- optimal work folder: `/home/truncate/Truncate-Live`

##### install Action Runner as service

```bash
sudo ./svc.sh install
sudo ./svc.sh start
# sudo ./svc.sh status
```

#### 4. install audiowaveform extension

```bash
cd package
sudo apt-get update
sudo apt-get install -fy
sudo dpkg -i audiowaveform_1.9.1-1-11_amd64.deb
sudo apt-get install -fy
sudo apt-get -f install -y
```


### Backend Setup

#### 1. set enviroment file Secret

[GitHub Backend Secrets](https://github.com/Truncatemusic/Truncate2023-BE/settings/secrets/actions)

```dotenv
# Secret: SETUP_ENV

CWD=  # absolute path to the backend directory ( /home/truncate/Truncate-Live/Truncate2023-BE/Truncate2023-BE )

WEB_HOST=https://truncatemusic.de
CORS_ORIGIN=https://truncatemusic.de

DATABASE_URL=  # db url with "mysql:" protocol and schema ( mysql://{USERNAME}:{PASSWORD}@localhost:3306/truncate )

SMTP_HOST=  # smtp host ( when using maildev for testing: smtp://localhost:1025 )
SMTP_FROM=noreply@truncatemusic.de

GOOGLE_STORAGE_BUCKET_PREFIX=cbljtr-live-
```

#### 2. set GCS key Secret

1. [Enable the Google Cloud Storage API](https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com)

2. Create and download API key JSON
   - **[IAM & Admin > Service Accounts](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts) > ({project}) > {service account}: manage keys > ADD KEY: Create new Key > JSON**

3. Set `GOOGLE_CLOUD_STORAGE_KEY` Secret at [GitHub Backend Secrets](https://github.com/Truncatemusic/Truncate2023-BE/settings/secrets/actions) 

#### ( 3. create maildev container - for testing only! )

```yaml
# docker-compose.yml

version: '3'

networks:
    default:

services:
    maildev:
        image: maildev/maildev
        container_name: maildev
        networks:
            default:
                aliases:
                    - maildev
        ports:
            - "1080:1080"
            - "1025:1025"
        restart: always
```
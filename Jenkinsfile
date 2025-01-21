pipeline {
    agent any
    environment {
        HOME = '.'
    }
    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying to Nginx...'
                sh 'cp -R build/* /var/www/intervolz.com/html'
            }
        }
    }
    post {
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed.'
        }
    }
}

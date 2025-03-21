pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS = credentials('dockerhub')
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/trahulprabhu38/resq-web.git'
                echo "----------------------- Git connected -----x--------------------------"
            }
        }
        stage('docker login'){
            steps{
                sh 'docker login'
                echo "----------------------- Docker logged in successfully -------------------------------"

            }
        }
    
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t trahulprabhu38/resq-frontend:v1.2 --platform linux/amd64 -f ./client/Dockerfile ./client'
                sh 'docker build -t trahulprabhu38/resq-backend:latest --platform linux/amd64 -f ./server/Dockerfile ./server'
                echo "----------------------- Docker images built successfully -------------------------------"
            }
        }

        stage('Push to Docker Hub') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
            sh 'docker push trahulprabhu38/resq-frontend:v1.2'
            sh 'docker push trahulprabhu38/resq-backend:latest'
            }
        }
        }


        stage('Deploy to Kubernetes') {
            steps {
                sh 'echo "Skipping Kubernetes deployment for now."'
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}


pipeline {
  agent any
  stages {
    stage('checkout') {
      steps {
        scmSkip(deleteBuild: false, skipPattern:'.*\[ci skip\].*')
        
        checkout([$class: 'GitSCM',
        branches: [[name: '*/master']],
        userRemoteConfigs: [[url: 'https://github.com/TheresaQWQ/SuperBot.git']]
        ])
      }
    }
    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }
    stage('Create config') {
      steps {
        sh 'cp ./config.example.js ./config.js'
      }
    }
    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run ci'
      }
    }
  }
}
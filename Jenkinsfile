pipeline {
  agent any
  stages {
    stage('approve ') {
      steps {
        input(message: 'Really deploy?', id: 'deploy-input', ok: 'Do it!')
      }
    }
    stage('create/tag jar') {
      steps {
        echo 'jar created'
      }
    }
    stage('create descriptor') {
      steps {
        echo 'descriptor created'
      }
    }
    stage('deploy with ansible') {
      steps {
        echo 'deployed'
      }
    }
    stage('switch production environment') {
      steps {
        echo 'switch'
      }
    }
    stage('send notifications') {
      steps {
        echo 'send notifications'
      }
    }
  }
}
pipeline {
  agent any
  stages {
    stage('Approve ') {
      steps {
        input(message: 'Deploy?', id: 'deploy-input', submitter: 'zeiler')
      }
    }
  }
}
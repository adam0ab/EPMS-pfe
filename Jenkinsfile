pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds() }
  parameters {
    string(name: 'GIT_URL', defaultValue: 'https://github.com/adam0ab/EPMS-pfe.git', description: 'Git repository to clone')
    string(name: 'GIT_BRANCH', defaultValue: 'pfe', description: 'Git branch to build')
  }
  environment {
    IMAGE_NAME = 'epms-api'
    DEPLOY_DIR = '/vagrant/deploy'
    SONAR_HOST_URL = 'http://sonarqube:9000'
    TRIVY_IMAGE = 'aquasec/trivy:0.57.1'
  }
  stages {
    stage('Clone Git repository') {
      steps { git branch: params.GIT_BRANCH, url: params.GIT_URL }
    }
    stage('Load local CI/CD definitions') {
      steps {
        sh 'cp /vagrant/apps/server/Dockerfile apps/server/Dockerfile'
        sh 'cp /vagrant/.dockerignore .dockerignore'
        sh 'cp /vagrant/sonar-project.properties sonar-project.properties'
      }
    }
    stage('Install') { steps { sh 'npm ci' } }
    stage('Build and TypeScript checks') {
      steps {
        sh 'npm run build --workspace=@epms/shared'
        sh 'npm run build --workspace=@epms/server'
      }
    }
    stage('SonarQube static analysis') {
      steps {
        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
          sh 'docker run --rm --network deploy_default --volumes-from deploy-jenkins-1 -w "$WORKSPACE" -e SONAR_HOST_URL=$SONAR_HOST_URL -e SONAR_TOKEN=$SONAR_TOKEN sonarsource/sonar-scanner-cli:latest'
        }
      }
    }
    stage('Trivy filesystem scan') {
      steps {
        sh 'docker run --rm --volumes-from deploy-jenkins-1 $TRIVY_IMAGE fs --exit-code 1 --severity HIGH,CRITICAL --scanners vuln,secret,misconfig "$WORKSPACE"'
      }
    }
    stage('Build API image') {
      steps { sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER -t $IMAGE_NAME:latest -f apps/server/Dockerfile .' }
    }
    stage('Trivy image scan') {
      steps {
        sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock $TRIVY_IMAGE image --exit-code 1 --severity HIGH,CRITICAL $IMAGE_NAME:$BUILD_NUMBER'
      }
    }
    stage('Deploy with Docker Compose') {
      when { expression { params.GIT_BRANCH == 'pfe' } }
      steps {
        sh 'test -f $DEPLOY_DIR/.env'
        sh 'docker compose -f $DEPLOY_DIR/docker-compose.yml up -d --no-build mongodb api'
        sh 'for attempt in $(seq 1 12); do status=$(docker inspect --format="{{.State.Health.Status}}" $(docker compose -f $DEPLOY_DIR/docker-compose.yml ps -q api)); [ "$status" = healthy ] && exit 0; sleep 5; done; exit 1'
      }
    }
  }
  post { always { cleanWs(deleteDirs: true, notFailBuild: true) } }
}

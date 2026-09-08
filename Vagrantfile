Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "epms-devops"
  config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1", auto_correct: true
  config.vm.network "forwarded_port", guest: 9000, host: 9000, host_ip: "127.0.0.1", auto_correct: true
  config.vm.network "forwarded_port", guest: 4000, host: 4000, host_ip: "127.0.0.1", auto_correct: true
  config.vm.network "forwarded_port", guest: 50000, host: 50000, host_ip: "127.0.0.1", auto_correct: true
  config.vm.provider "virtualbox" do |vb|
    vb.name = "epms-devops"
    vb.cpus = 4
    vb.memory = 8192
  end
  config.vm.provision "shell", path: "infra/provision-devops.sh", privileged: true
end

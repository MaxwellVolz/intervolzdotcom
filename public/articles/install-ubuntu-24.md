@@Title: Fresh Ubuntu 24
@@URL: install-ubuntu-24
@@Date: 5/25/2024
@@TLDR: because a fresh system is a fast system...
@@Tags: unix
@@WordCount: 151
@@ReadEstimate: 12

# Ubuntu Home Webserver

## What is it?

A home server for our websites! And hosting whatever we want! Free from the shackles (heh) of AWS. AWS is amazing. I just don't wanna pay...

We will be setting up a homeserver from scratch on an old box we have laying around.

Let's get to it.

## Install Ubuntu

### Download Ubuntu ISO:

Visit [Ubuntu Downloads](https://ubuntu.com/download).
Choose the version you want and download the ISO file.

### On Linux

Double check your volumes.

```sh
sudo dd bs=4M if=/path/to/ubuntu.iso of=/dev/sdX status=progress oflag=sync
```
Replace **/path/to/ubuntu.iso** with the path to the ISO file and **/dev/sdX** with the USB drive (be very careful with this command as it can overwrite data).

### On Windows & Mac

1. Use Rufus
2. Use Disk Partition

### Boot from USB Drive:

1. Insert the bootable USB drive into the computer where you want to install Ubuntu.
2. Restart the computer and enter the BIOS/UEFI settings (usually by pressing a key like F2, F12, DEL, or ESC during boot).
3. Change the boot order to prioritize the USB drive.
4. Save changes and exit.

## System Setup


### Google Chrome
```sh
sudo apt update

# chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
sudo apt update
sudo apt upgrade google-chrome-stable

```

### Git, zsh, oh my zsh

```sh
sudo apt install git
sudo apt update

sudo apt install zsh
chsh -s $(which zsh)

# open zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

```


### Jenkins with Github Credentials

```sh
sudo apt update
sudo apt install openjdk-11-jdk -y

sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins
```
### Enable Jenkins service

```
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### Configure Firewall

```sh
sudo ufw allow 8080
sudo ufw status
```

###
@@Title: Home Server Setup
@@URL: home-server-setup
@@Date: 4/25/2024
@@TLDR: Setting up a homeserver with Ubuntu 24, basic apps and tooling
@@Tags: unix
@@WordCount: 151
@@ReadEstimate: 12

# Ubuntu Home Webserver

## What is it?

We will be setting up a small intel box to run `Ubuntu 24`

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


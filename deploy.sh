#!/bin/sh
DECKY_IP_ADDR=
DECKY_SSH_PORT=
DECKY_SSH_PASSWORD=
SRC_DIR=$(pwd)

while getopts 'a:p:P:' c
do
  case $c in
    a) DECKY_IP_ADDR=$OPTARG ;;
    p) DECKY_SSH_PORT=$OPTARG ;;
    P) DECKY_SSH_PASSWORD=$OPTARG ;;
  esac
done


rsync \
    -avzh \
    --rsh="/usr/bin/sshpass -p ${DECKY_SSH_PASSWORD} ssh -p ${DECKY_SSH_PORT} -o StrictHostKeyChecking=no -l deck" \
    --progress \
    --files-from="${SRC_DIR}/deploy.files" \
    "${SRC_DIR}"/ \
    deck@${DECKY_IP_ADDR}:homebrew/plugins/steamdeck-flatpak-updater-plugin/

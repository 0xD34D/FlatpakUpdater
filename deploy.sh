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

ssh_cmd="/usr/bin/sshpass -p ${DECKY_SSH_PASSWORD} ssh -p ${DECKY_SSH_PORT} -o StrictHostKeyChecking=no -l deck"

# make sure we can write to the plugin directory
${ssh_cmd} ${DECKY_IP_ADDR} "chmod 0755 -R /home/deck/homebrew/plugins/FlatpakUpdater"

# sync plugin to steam deck
rsync \
    -avzh \
    --rsh="${ssh_cmd}" \
    --progress \
    --files-from="${SRC_DIR}/deploy.files" \
    "${SRC_DIR}"/ \
    ${DECKY_IP_ADDR}:homebrew/plugins/FlatpakUpdater/

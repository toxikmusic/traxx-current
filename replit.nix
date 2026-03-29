{pkgs}: {
  deps = [
    pkgs.lsof
    pkgs.nginx
    pkgs.run
    pkgs.boot
    pkgs.unzip
    pkgs.postgresql
    pkgs.jq
  ];
}

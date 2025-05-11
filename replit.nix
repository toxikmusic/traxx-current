{pkgs}: {
  deps = [
    pkgs.nginx
    pkgs.run
    pkgs.boot
    pkgs.unzip
    pkgs.postgresql
    pkgs.jq
  ];
}

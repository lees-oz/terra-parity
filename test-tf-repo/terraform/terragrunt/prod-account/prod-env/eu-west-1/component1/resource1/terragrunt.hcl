locals {
  name = "resource1"
  tag = 123
}

terraform {
  source = "modules/lambda"
}

inputs = {
  name = local.name
  memory = 1024
}

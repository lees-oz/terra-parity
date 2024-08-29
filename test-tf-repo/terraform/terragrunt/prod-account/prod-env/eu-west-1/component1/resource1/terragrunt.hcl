locals {
  name = "resource1"
}

terraform {
  source = "modules/lambda"
}

inputs = {
  name = local.name
  memory = 1024
}
 
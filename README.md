# Terra parity

## Why

This extension is aiming to improve development experience, quality and productivity for engineers doing Infrastructure as Code for software products practicing CI/CD. *Terra parity* helps to quickly find, compare and align corresponding resources on different environments.

Particularly, if the following applies to you, you can benefit from this extension:
- code provisioning one environment is located in one folder. For example your infra code repository has folders like `terraform/terragrunt/1234567890/staging/us-east-1/...` where the folder `terraform/terragrunt/1234567890-dev/staging` contains *all* code provisioning this environment. This is relatively common for terragrunt users (see https://docs.gruntwork.io/foundations/iac-foundations/folder-structure/) and sometimes terraform users.
- you'd like to keep your application environments as similar as possible, as described in https://12factor.net/dev-prod-parity

## How to use

### Configure environment paths
*Environment paths* is a set of environment folders relative paths. Open extension Settings and one by one copy relative path of your environment folder and add them to *Environment paths* using button "Add Item".

### Call Terra parity
1. Select the IaC file from one of the environments
2. Run command *Terra parity* from command palette (⇧⌘P)
3. From the dropdown list you can see the preview of files comparison (match, differ or not found) and choose the environment and press Enter
4. The comparison window will open.

Example: Imagine your `terragrunt` repository is organized like this:
```
terraform
 └ terragrunt
   └ dev-account
     └ dev-env
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
             └ some.json
           └ resource2
             └ terragrunt.hcl
     └ test-env
       └ eu-west-1
         └ app2
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
             └ some.json
           └ resource2
             └ terragrunt.hcl
   └ prod-account
     └ prod-env
       └ eu-west-1
         └ app2
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
             └ some.json
           └ resource2
             └ terragrunt.hcl
```

In this case there's 3 environments - `dev`, `test` and `prod`. When you make changes to resource1/terragrunt.hcl file on `dev` environment you'd want to also check `test` and `prod` environments to compare and align them.
When you edit 
These 3 files are located under following paths:
- `terraform/terragrunt/dev-account/dev-env/us-east-1/category1/resource1/terragrunt.hcl`
- `terraform/terragrunt/dev-account/test-env/us-east-1/category1/resource1/terragrunt.hcl`
- `terraform/terragrunt/prod-account/prod-env/us-east-1/category1/resource1/terragrunt.hcl`
Switching between them is usually painful - need to scroll through potentially long list of folders in the Folders view.


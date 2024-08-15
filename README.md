# Terra parity

## Who is this for?

This extension is aiming to improve development experience, quality and productivity for engineers doing Infrastructure as Code for software products practicing CI/CD. Particularly, if the following applies to you, you can benefit from this extension:
- your Infrastructure as Code folder structure has separate folders for different accounts/environments - dev, staging, prod, etc. This is more common for those who use terragrunt (see https://docs.gruntwork.io/foundations/iac-foundations/folder-structure/) and sometimes terraform users.
- you'd like to keep product environments as similar as possible, as described in https://12factor.net/dev-prod-parity

*Terra parity* helps to quickly find, compare and align corresponding resources on different environments.

## How to use it

Imagine your `terragrunt` repository is organized like this:
```
terraform
 └ terragrunt
   └ dev-account
     └ dev-env
       └ us-east-1
         └ category1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
     └ test-env
       └ us-east-1
         └ category1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
   └ prod-account
     └ prod-env
       └ us-east-1
         └ category1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
```

In this case there's 3 environments - `dev`, `test` and `prod`. When you make changes to resource1/terragrunt.hcl file on dev environment you'd want to switch between resource1 of dev, test and prod environments and most probably make them same, so that there's a need to switch between these hcl's and be able to compare them quickly.
These 3 files are located under following paths:
- `terraform/terragrunt/dev-account/dev-env/us-east-1/category1/resource1/terragrunt.hcl`
- `terraform/terragrunt/dev-account/test-env/us-east-1/category1/resource1/terragrunt.hcl`
- `terraform/terragrunt/prod-account/prod-env/us-east-1/category1/resource1/terragrunt.hcl`
Switching between them is usually painful - need to scroll through potentially long list of folders in the Folders view.

### Configure your environments
Extension needs to understand which environment does the given file belong to. This is done by finding an environment identifier in file path as a substring. Example:
Your file structure looks like following



Specify the list of such substrings, this will be an identifier for environment. Ideally 
Examples and screenshots tbd.

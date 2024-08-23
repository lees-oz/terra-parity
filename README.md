{Screenshot with menus}

# Terra parity

## Why

*Terra parity* is made to improve experience, work quality and productivity for engineers utilizing Infrastructure as Code and CI/CD for building software systems. 

Particularly, if the following applies to you:
- **folder-per-environment:** each environment (`dev`, `test`, `prod` etc.) in IaC code repository has a dedicated folder
- **test/prod parity:** you'd like to keep your environments as similar as possible (see https://12factor.net/dev-prod-parity), so that infrastructure configuration that gets released is same as the one that was tested

then infrastructure code would have a lot of duplication across different environments and few for-a-good-reason differences.

***Terra parity* is aiming to help engineers make changes to such code a bit more robust by providing a way to quickly navigate, compare and align code of corresponding resources.**

### Example

Imagine you provision infrastructure for an application that has three environments - `dev`, `test` and `prod`, and your infrastructure as code has folder dedicated to each environment, so that the repository looks like this:
```
terraform
 └ terragrunt
   └ dev-account
     └ dev-env
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
     └ test-env
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
   └ prod-account
     └ prod-env
       └ us-east-1
         └ app1
           └ resource1
             └ terragrunt.hcl
           └ resource2
             └ terragrunt.hcl
```

You work on a change that involves changing `app1`'s `resource1`. In that case, you'd want to first change `terragrunt.hcl` on `dev` and then repeat change on `test` and `prod`. Because all 3 files are located far from each other in the file tree, navigating between them in VS Code's Explorer could be time and energy consuming, especially when the repository is big.
Invoking *Terra parity* would render a menu, showing the info that `dev`↔`test` and `dev`↔`prod` files are different. Selecting either of the menus will open files comparison window, where the `test` or `prod` code could be aligned in place with `dev`.

## How to use

### Configure environment paths
*Environment paths* is a set of environment folders relative paths. Open extension Settings and one by one copy relative path of your environment folder and add them to *Environment paths* using button "Add Item".

### Call Terra parity
1. Open one of the environment IaC file in the editor.
2. Run command *Terra parity* from command palette (⇧⌘P)
3. *Terra parity* will determine the opened file's environment and for every other environment would try to find the files  under corresponding environment's *Environment path* and the subpath same as the opened file. The file will be compared with opened file's content and the menu item will be rendered:
<screenshot with menus>
  3.1 In case the files contents are same, the menu will indicate it with text "Match". Upon selection the files comparison will be opened.
3.2 In case the files contents differ, the menu will indicate it with text "Different". Upon selection the files comparison will be opened.
3.3 In case the file doesn't exist on that environment, the menu will indicate it with text "Not found". Upon selection the file will be copied to corresponding environment's location and the files comparison will be opened.


###### Technically this tool has nothing to do with infrastructure as code, terraform or terragrunt. It is not limited to infrastructure as code or any other code. It only knows about files and folders.
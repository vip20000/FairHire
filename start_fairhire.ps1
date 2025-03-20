Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "cd D:\Fair_Hire\fairhire-backend\proctoring_env; .\Scripts\activate; cd ..\proctoring_service; python -u proctor.py"

Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "cd D:\Fair_Hire\fairhire-frontend; npm start"

Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "cd D:\Fair_Hire\fairhire-backend\fairhireb_env; .\Scripts\activate; cd ..\fairhire_backend_dev; python manage.py runserver"

Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "cd D:\Fair_Hire\fairhire-backend\qgen_env; .\Scripts\activate; cd ..\qgen_service; python -u qgen.py"

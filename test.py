import os

def rename_jpg_to_jpeg(folder_path):
    # 遍历指定文件夹中的所有文件
    for filename in os.listdir(folder_path):
        # 检查文件扩展名是否为.jpg
        if filename.endswith('.jpg'):
            # 构建新的文件名
            new_filename = filename[:-4] + '.jpeg'
            # 获取原始文件的完整路径
            old_file = os.path.join(folder_path, filename)
            # 获取新文件的完整路径
            new_file = os.path.join(folder_path, new_filename)
            # 重命名文件
            os.rename(old_file, new_file)
            print(f'Renamed: {old_file} to {new_file}')

# 调用函数并传入文件夹路径
folder_path = 'C:\\Users\\10792\\Downloads\\新建文件夹'
rename_jpg_to_jpeg(folder_path)
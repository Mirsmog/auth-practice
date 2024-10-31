import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoBodyDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createTodoDto: CreateTodoBodyDto) {
    return this.todoService.create({ ...createTodoDto, userId });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.todoService.findById(id);
  }

  @Get()
  findAllByUserId(@CurrentUser('id') id: string) {
    return this.todoService.findByUserId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }
}

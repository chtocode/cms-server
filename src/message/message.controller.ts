import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    Request,
    Response,
    Sse,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response as ExResponse } from 'express';
import { interval, merge, Observable } from 'rxjs';
import { mapTo, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AllowAnon } from '../auth/allow-anon';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';
import { Message, MessageType } from './model/message';

@Controller(IApiTags.Message.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiTags(IApiTags.Message)
@ApiBearerAuth()
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
        return this.messageService.create({ to: req.user.userId, ...createMessageDto });
    }

    /**
     *
     * @param status message status; Query all messages equal to the status if it passed in, otherwise query all state messages;
     * @param userId indicate the query result belongs to which user. By default, use current user's id;
     * @param req - request;
     * @returns messages meet the conditions;
     */
    @Get()
    @ApiQuery({ name: 'status', enum: [0, 1], description: 'message status', required: false })
    @ApiQuery({ name: 'userId', type: 'number', description: 'user id', required: false })
    @ApiQuery({ name: 'limit', type: 'number', description: 'query count', required: false })
    @ApiQuery({ name: 'page', type: 'number', description: 'current page. first page: 1', required: false })
    @ApiQuery({ name: 'type', type: 'enum', description: 'message type', required: false })
    findAll(
        @Query('status') status: number,
        @Query('userId') userId: number,
        @Query('limit') limit: number,
        @Query('page') page: number,
        @Query('type') type: MessageType,
        @Request() req,
    ) {
        if (!userId) {
            userId = req.user.userId;
        }

        return this.messageService.findAll(userId, limit || 10, page || 1, status, type);
    }

    /**
     * ! 加个前缀路径，显式区分不同的GET路由。 否则 @Get(':id') Get('heart') 会区分不出来
     */
    @Get('/id/:id')
    findOne(@Param('id') id: number) {
        return this.messageService.findOne(+id);
    }

    @Put()
    update(@Body() updateMessageDto: UpdateMessageDto) {
        return this.messageService.update(updateMessageDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.messageService.remove(id);
    }

    @Get('/statistics')
    @ApiQuery({
        name: 'userId',
        type: 'number',
        required: false,
        description: "return current user's statistic if not set",
    })
    getStatistic(@Query('userId') userId: number, @Request() req) {
        if (!userId) {
            userId = req.user.userId;
        }

        return this.messageService.statistic(userId);
    }

    /**
     *
     * @param userId 监听特定用户的事件
     * @param req
     * @description 每隔5秒发送心跳包,发送失败时释放连接。客户端
     */
    @AllowAnon()
    @Sse('subscribe')
    sse(@Query('userId') userId: number, @Response() res: ExResponse): Observable<MessageEvent<Message | string>> {
        if (!userId) {
            throw new BadRequestException('User id can not found!');
        } else {
            const heartbeat = interval(5 * 1000).pipe(
                mapTo({ content: '💟', type: 'heartbeat' }),
                tap(() => {
                    if (res.statusCode !== 200) {
                        res.write('heart stopped \n');
                        res.socket.end();
                    }
                }),
            );
            const source = this.messageService.message$
                .asObservable()
                .pipe(switchMap((content) => heartbeat.pipe(startWith({ content, type: content.type }))));

            return merge(heartbeat.pipe(takeUntil(source)), source) as Observable<MessageEvent<Message>>;
        }
    }
}
